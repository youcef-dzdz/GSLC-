<?php

namespace App\Services;

use App\Models\EtapeWorkflow;
use App\Models\InstanceWorkflow;
use App\Models\User;
use App\Models\Workflow;
use Illuminate\Database\Eloquent\Model;

class WorkflowService
{
    // =========================================================================
    // START — create a new workflow instance for an entity
    // $typeCode: e.g. 'DEMANDE_IMPORT', 'DEVIS', 'CONTRAT_IMPORT'
    // $entite: the Eloquent model this workflow tracks (DemandeImport, ContratImport, etc.)
    // =========================================================================

    public function demarrer(string $typeCode, Model $entite): InstanceWorkflow
    {
        $workflow = Workflow::where('code', $typeCode)
            ->where('actif', true)
            ->with(['etapes' => fn($q) => $q->orderBy('ordre')])
            ->firstOrFail();

        $premiereEtape = $workflow->etapes->first();

        $data = [
            'workflow_id'     => $workflow->id,
            'etape_actuelle'  => $premiereEtape?->ordre ?? 1,
            'date_debut'      => now(),
            'date_fin_prevue' => $this->calculerDateFin($workflow),
            'progression'     => 0,
            'statut'          => 'EN_COURS',
        ];

        // Link to the right entity based on type
        if ($entite->getTable() === 'conteneurs') {
            $data['conteneur_id'] = $entite->id;
        } elseif ($entite->getTable() === 'demandes_import') {
            $data['demande_id'] = $entite->id;
        }

        return InstanceWorkflow::create($data);
    }

    // =========================================================================
    // ADVANCE — move to the next step
    // =========================================================================

    public function avancer(InstanceWorkflow $instance): InstanceWorkflow
    {
        if ($instance->estTermine()) {
            throw new \LogicException("Ce workflow est déjà terminé.");
        }

        if ($instance->estBloque()) {
            throw new \LogicException("Ce workflow est bloqué. Débloquez-le avant d'avancer.");
        }

        $workflow = $instance->workflow()->with(['etapes' => fn($q) => $q->orderBy('ordre')])->first();
        $etapes   = $workflow->etapes;
        $total    = $etapes->count();

        $etapeActuelle = $etapes->firstWhere('ordre', $instance->etape_actuelle);
        $etapeSuivante = $etapes->firstWhere('ordre', '>', $instance->etape_actuelle);

        if (! $etapeSuivante) {
            // No more steps — mark as done
            $instance->update([
                'statut'          => 'TERMINE',
                'date_fin_reelle' => now(),
                'progression'     => 100,
            ]);
        } else {
            $newOrdre   = $etapeSuivante->ordre;
            $progression = $total > 0 ? round(($newOrdre / $total) * 100, 2) : 0;

            $instance->update([
                'etape_actuelle' => $newOrdre,
                'progression'    => $progression,
            ]);
        }

        return $instance->fresh();
    }

    // =========================================================================
    // BLOCK / UNBLOCK
    // =========================================================================

    public function bloquer(InstanceWorkflow $instance, User $user, string $motif): void
    {
        $instance->update([
            'statut'           => 'BLOQUE',
            'bloque_par_user_id' => $user->id,
            'motif_blocage'    => $motif,
        ]);
    }

    public function debloquer(InstanceWorkflow $instance): void
    {
        $instance->update([
            'statut'           => 'EN_COURS',
            'bloque_par_user_id' => null,
            'motif_blocage'    => null,
        ]);
    }

    // =========================================================================
    // INFO — current step details
    // =========================================================================

    public function getEtapeActuelle(InstanceWorkflow $instance): ?EtapeWorkflow
    {
        return EtapeWorkflow::where('workflow_id', $instance->workflow_id)
            ->where('ordre', $instance->etape_actuelle)
            ->first();
    }

    public function getResume(InstanceWorkflow $instance): array
    {
        $workflow      = $instance->workflow()->with(['etapes' => fn($q) => $q->orderBy('ordre')])->first();
        $etapes        = $workflow->etapes;
        $etapeActuelle = $etapes->firstWhere('ordre', $instance->etape_actuelle);
        $etapeSuivante = $etapes->firstWhere('ordre', '>', $instance->etape_actuelle);

        return [
            'workflow_id'    => $workflow->id,
            'workflow_nom'   => $workflow->nom_processus,
            'statut'         => $instance->statut,
            'progression'    => (float) $instance->progression,
            'etape_actuelle' => [
                'ordre'           => $etapeActuelle?->ordre,
                'nom'             => $etapeActuelle?->nom_etape,
                'role_responsable'=> $etapeActuelle?->role_responsable,
            ],
            'etape_suivante' => $etapeSuivante ? [
                'ordre' => $etapeSuivante->ordre,
                'nom'   => $etapeSuivante->nom_etape,
            ] : null,
            'total_etapes'   => $etapes->count(),
            'est_bloque'     => $instance->estBloque(),
            'motif_blocage'  => $instance->motif_blocage,
            'date_debut'     => $instance->date_debut,
            'date_fin_prevue'=> $instance->date_fin_prevue,
        ];
    }

    // =========================================================================
    // PRIVATE
    // =========================================================================

    private function calculerDateFin(Workflow $workflow): ?\Carbon\Carbon
    {
        $totalHeures = $workflow->etapes()->sum('delai_heures');
        if (! $totalHeures) return null;
        return now()->addHours($totalHeures);
    }
}
