<?php

namespace App\Services;

use App\Models\CalculPenalite;
use App\Models\ContratImport;
use App\Models\Conteneur;
use App\Models\Franchise;
use App\Models\MouvementConteneur;
use App\Models\Penalite;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;

class SurestarieService
{
    private const TVA_RATE = 0.19;

    // =========================================================================
    // FRANCHISE LOOKUP
    // Priority: client-specific > port-specific > type-only (global)
    // =========================================================================

    public function getFranchise(int $typeConteneurId, ?int $portId, ?int $clientId, string $type = 'DEMURRAGE'): ?Franchise
    {
        $base = Franchise::where('type_conteneur_id', $typeConteneurId)
            ->where('type_franchise', $type)
            ->where('actif', true)
            ->where(fn($q) => $q->whereNull('date_fin_validite')->orWhere('date_fin_validite', '>=', now()));

        // 1. Client + port specific
        if ($clientId && $portId) {
            $f = (clone $base)->where('client_id', $clientId)->where('port_id', $portId)->first();
            if ($f) return $f;
        }

        // 2. Client only
        if ($clientId) {
            $f = (clone $base)->where('client_id', $clientId)->whereNull('port_id')->first();
            if ($f) return $f;
        }

        // 3. Port only
        if ($portId) {
            $f = (clone $base)->whereNull('client_id')->where('port_id', $portId)->first();
            if ($f) return $f;
        }

        // 4. Global fallback
        return (clone $base)->whereNull('client_id')->whereNull('port_id')->first();
    }

    // =========================================================================
    // PENALTY RATES — ordered tranches for progressive billing
    // =========================================================================

    public function getPenalites(int $typeConteneurId, string $type = 'DEMURRAGE'): \Illuminate\Support\Collection
    {
        return Penalite::where('type_conteneur_id', $typeConteneurId)
            ->where('type', $type)
            ->where('actif', true)
            ->where(fn($q) => $q->whereNull('date_fin_validite')->orWhere('date_fin_validite', '>=', now()))
            ->orderBy('tranche_debut')
            ->get();
    }

    // =========================================================================
    // MAIN CALCULATION — returns a preview array, nothing saved yet
    // =========================================================================

    public function calculer(Conteneur $conteneur, ContratImport $contrat, ?Carbon $dateReference = null, string $type = 'DEMURRAGE'): array
    {
        $dateReference = ($dateReference ?? now())->copy()->startOfDay();

        // Find arrival movement (ARRIVE_PORT) to anchor the franchise clock
        $arrivee = MouvementConteneur::where('conteneur_id', $conteneur->id)
            ->where('type_mouvement', 'ARRIVE_PORT')
            ->orderByDesc('date_mouvement')
            ->first();

        if (! $arrivee) {
            return $this->emptyResult($conteneur->id, $contrat->id, 'Aucun mouvement ARRIVE_PORT trouvé pour ce conteneur.');
        }

        $dateArrivee     = $arrivee->date_mouvement->copy()->startOfDay();
        $portId          = $arrivee->port_id;
        $typeConteneurId = $conteneur->type_id;

        $franchise      = $this->getFranchise($typeConteneurId, $portId, $contrat->client_id, $type);
        $joursFranchise = $franchise ? $franchise->jours_franchise : 0;

        $joursEcoules = (int) $dateArrivee->diffInDays($dateReference);
        $joursRetard  = max(0, $joursEcoules - $joursFranchise);

        if ($joursRetard === 0) {
            return array_merge($this->emptyResult($conteneur->id, $contrat->id), [
                'numero_conteneur'         => $conteneur->numero_conteneur,
                'date_arrivee'             => $dateArrivee->toDateString(),
                'date_reference'           => $dateReference->toDateString(),
                'port_id'                  => $portId,
                'jours_ecoules'            => $joursEcoules,
                'jours_franchise_appliques'=> $joursFranchise,
                'franchise'                => $franchise,
            ]);
        }

        // Calculate tiered penalty amount
        $penalites  = $this->getPenalites($typeConteneurId, $type);
        $montantHt  = 0.0;
        $detail     = [];
        $lastPenaliteId  = null;
        $lastTarifJour   = 0.0;

        foreach ($penalites as $penalite) {
            $trancheDebut = $penalite->tranche_debut;                   // e.g. 1
            $trancheFin   = $penalite->tranche_fin;                     // e.g. 7 or null

            if ($trancheDebut > $joursRetard) break;

            $joursFin      = $trancheFin ? min($joursRetard, $trancheFin) : $joursRetard;
            $joursTraanche = $joursFin - $trancheDebut + 1;
            $tarif         = (float) $penalite->tarif_journalier;
            $montantTr     = $joursTraanche * $tarif;
            $montantHt    += $montantTr;

            $detail[] = [
                'penalite_id'     => $penalite->id,
                'tranche_debut'   => $trancheDebut,
                'tranche_fin'     => $trancheFin,
                'jours'           => $joursTraanche,
                'tarif_journalier'=> $tarif,
                'montant'         => round($montantTr, 2),
                'devise'          => $penalite->devise?->code ?? 'DZD',
            ];

            $lastPenaliteId = $penalite->id;
            $lastTarifJour  = $tarif;
        }

        $tva        = round($montantHt * self::TVA_RATE, 2);
        $montantTtc = round($montantHt + $tva, 2);

        // date_debut for CalculPenalite = first day after franchise expires
        $dateDebutPenalite = $dateArrivee->copy()->addDays($joursFranchise + 1);

        return [
            'conteneur_id'             => $conteneur->id,
            'numero_conteneur'         => $conteneur->numero_conteneur,
            'contrat_id'               => $contrat->id,
            'port_id'                  => $portId,
            'type_penalite'            => $type,
            'date_arrivee'             => $dateArrivee->toDateString(),
            'date_debut_penalite'      => $dateDebutPenalite->toDateString(),
            'date_reference'           => $dateReference->toDateString(),
            'jours_ecoules'            => $joursEcoules,
            'jours_franchise_appliques'=> $joursFranchise,
            'jours_retard'             => $joursRetard,
            'montant_ht'               => round($montantHt, 2),
            'tva'                      => $tva,
            'montant_ttc'              => $montantTtc,
            'franchise'                => $franchise,
            'last_penalite_id'         => $lastPenaliteId,
            'last_tarif_journalier'    => $lastTarifJour,
            'penalites_detail'         => $detail,
            'erreur'                   => null,
        ];
    }

    // =========================================================================
    // SAVE — persist a CalculPenalite record from the preview array
    // =========================================================================

    public function sauvegarder(array $calcul, ?int $userId = null): CalculPenalite
    {
        return CalculPenalite::create([
            'conteneur_id'             => $calcul['conteneur_id'],
            'contrat_id'               => $calcul['contrat_id'],
            'penalite_id'              => $calcul['last_penalite_id'] ?? null,
            'franchise_id'             => $calcul['franchise']?->id,
            'cree_par_user_id'         => $userId ?? Auth::id(),
            'type_penalite'            => $calcul['type_penalite'] ?? 'DEMURRAGE',
            'date_debut'               => $calcul['date_debut_penalite'],
            'date_fin'                 => $calcul['date_reference'],
            'jours_franchise_appliques'=> $calcul['jours_franchise_appliques'],
            'jours_retard'             => $calcul['jours_retard'],
            'tarif_applique'           => $calcul['last_tarif_journalier'] ?? 0,
            'montant_ht'               => $calcul['montant_ht'],
            'tva'                      => $calcul['tva'],
            'montant_ttc'              => $calcul['montant_ttc'],
            'statut'                   => 'CALCULE',
        ]);
    }

    // =========================================================================
    // PREDICT — forecast when surestaries start + cost projections
    // =========================================================================

    public function predire(Conteneur $conteneur, ContratImport $contrat, string $type = 'DEMURRAGE'): array
    {
        $arrivee = MouvementConteneur::where('conteneur_id', $conteneur->id)
            ->where('type_mouvement', 'ARRIVE_PORT')
            ->orderByDesc('date_mouvement')
            ->first();

        if (! $arrivee) {
            return ['erreur' => 'Aucun mouvement ARRIVE_PORT trouvé.', 'alerte' => false];
        }

        $franchise = $this->getFranchise(
            $conteneur->type_id,
            $arrivee->port_id,
            $contrat->client_id,
            $type
        );

        $joursFranchise     = $franchise ? $franchise->jours_franchise : 0;
        $dateArrivee        = $arrivee->date_mouvement->copy()->startOfDay();
        $dateDebutSurestarie = $dateArrivee->copy()->addDays($joursFranchise + 1);
        $joursAvantSurestarie = (int) now()->startOfDay()->diffInDays($dateDebutSurestarie, false);

        // Project costs for +7, +14, +30 days from today
        $projections = [];
        foreach ([7, 14, 30] as $horizon) {
            $futureDate = now()->addDays($horizon);
            $calcul     = $this->calculer($conteneur, $contrat, $futureDate, $type);
            $projections["j+{$horizon}"] = [
                'date'         => $futureDate->toDateString(),
                'jours_retard' => $calcul['jours_retard'],
                'montant_ttc'  => $calcul['montant_ttc'],
            ];
        }

        return [
            'conteneur_id'             => $conteneur->id,
            'numero_conteneur'         => $conteneur->numero_conteneur,
            'date_arrivee'             => $dateArrivee->toDateString(),
            'jours_franchise'          => $joursFranchise,
            'date_debut_surestarie'    => $dateDebutSurestarie->toDateString(),
            'jours_avant_surestarie'   => $joursAvantSurestarie,
            'alerte'                   => $joursAvantSurestarie <= 2,
            'critique'                 => $joursAvantSurestarie <= 0,
            'projections'              => $projections,
            'erreur'                   => null,
        ];
    }

    // =========================================================================
    // SIMULATION — calculate without a real container (for quoting purposes)
    // =========================================================================

    public function simuler(int $typeConteneurId, ?int $portId, ?int $clientId, Carbon $dateArrivee, Carbon $dateReference, string $type = 'DEMURRAGE'): array
    {
        $franchise      = $this->getFranchise($typeConteneurId, $portId, $clientId, $type);
        $joursFranchise = $franchise ? $franchise->jours_franchise : 0;
        $joursEcoules   = (int) $dateArrivee->copy()->startOfDay()->diffInDays($dateReference->copy()->startOfDay());
        $joursRetard    = max(0, $joursEcoules - $joursFranchise);

        $penalites = $this->getPenalites($typeConteneurId, $type);
        $montantHt = 0.0;
        $detail    = [];

        foreach ($penalites as $penalite) {
            if ($penalite->tranche_debut > $joursRetard) break;
            $joursFin      = $penalite->tranche_fin ? min($joursRetard, $penalite->tranche_fin) : $joursRetard;
            $joursTraanche = $joursFin - $penalite->tranche_debut + 1;
            $tarif         = (float) $penalite->tarif_journalier;
            $montantTr     = $joursTraanche * $tarif;
            $montantHt    += $montantTr;
            $detail[] = [
                'tranche_debut'   => $penalite->tranche_debut,
                'tranche_fin'     => $penalite->tranche_fin,
                'jours'           => $joursTraanche,
                'tarif_journalier'=> $tarif,
                'montant'         => round($montantTr, 2),
            ];
        }

        $tva        = round($montantHt * self::TVA_RATE, 2);
        $montantTtc = round($montantHt + $tva, 2);

        return [
            'type_penalite'            => $type,
            'date_arrivee'             => $dateArrivee->toDateString(),
            'date_reference'           => $dateReference->toDateString(),
            'jours_ecoules'            => $joursEcoules,
            'jours_franchise_appliques'=> $joursFranchise,
            'jours_retard'             => $joursRetard,
            'montant_ht'               => round($montantHt, 2),
            'tva'                      => $tva,
            'montant_ttc'              => $montantTtc,
            'penalites_detail'         => $detail,
        ];
    }

    // =========================================================================
    // PRIVATE HELPERS
    // =========================================================================

    private function emptyResult(int $conteneurId, int $contratId, ?string $erreur = null): array
    {
        return [
            'conteneur_id'             => $conteneurId,
            'numero_conteneur'         => null,
            'contrat_id'               => $contratId,
            'port_id'                  => null,
            'type_penalite'            => 'DEMURRAGE',
            'date_arrivee'             => null,
            'date_debut_penalite'      => null,
            'date_reference'           => now()->toDateString(),
            'jours_ecoules'            => 0,
            'jours_franchise_appliques'=> 0,
            'jours_retard'             => 0,
            'montant_ht'               => 0,
            'tva'                      => 0,
            'montant_ttc'              => 0,
            'franchise'                => null,
            'last_penalite_id'         => null,
            'last_tarif_journalier'    => 0,
            'penalites_detail'         => [],
            'erreur'                   => $erreur,
        ];
    }
}
