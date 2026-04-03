<?php

namespace App\Http\Controllers\Finance;

use App\Http\Controllers\Controller;

use App\Http\Controllers\Traits\Auditable;
use App\Models\Facture;
use App\Models\LigneFacture;
use App\Models\Paiement;
use App\Models\Devise;
use App\Models\ConfigurationSysteme;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class FactureController extends Controller
{
    use Auditable;

    // =========================================================================
    // INDEX
    // =========================================================================

    public function index(Request $request): JsonResponse
    {
        $query = Facture::with(['client', 'contrat'])
            ->orderByDesc('date_emission');

        if ($request->filled('statut')) {
            $query->where('statut', $request->statut);
        }

        if ($request->filled('client_id')) {
            $query->where('client_id', $request->client_id);
        }

        // Flag overdue
        $factures = $query->paginate(20);

        $factures->getCollection()->transform(fn($f) => [
            'id'              => $f->id,
            'numero_facture'  => $f->numero_facture,
            'client'          => $f->client?->raison_sociale,
            'client_id'       => $f->client_id,
            'montant_ttc'     => (float) $f->montant_ttc,
            'montant_paye'    => (float) $f->montant_paye,
            'montant_restant' => (float) $f->montant_restant,
            'statut'          => $f->statut,
            'date_emission'   => $f->date_emission,
            'date_echeance'   => $f->date_echeance,
            'est_en_retard'   => $f->statut !== 'PAYEE' && $f->date_echeance < today(),
            'jours_retard'    => $f->statut !== 'PAYEE' && $f->date_echeance < today()
                                    ? today()->diffInDays($f->date_echeance)
                                    : 0,
        ]);

        return response()->json($factures);
    }

    // =========================================================================
    // SHOW
    // =========================================================================

    public function show(int $id): JsonResponse
    {
        $facture = Facture::with([
            'client',
            'contrat',
            'lignes',
            'paiements.banque',
            'devise',
            'creePar',
        ])->findOrFail($id);

        // 3-currency conversion
        $eurRate = (float) Devise::where('code', 'EUR')->value('taux_actuel') ?: 147.50;
        $usdRate = (float) Devise::where('code', 'USD')->value('taux_actuel') ?: 134.20;

        return response()->json([
            'facture'  => $facture,
            'montants' => [
                'dzd' => (float) $facture->montant_ttc,
                'eur' => round($facture->montant_ttc / $eurRate, 2),
                'usd' => round($facture->montant_ttc / $usdRate, 2),
                'source_taux' => Devise::where('code', 'EUR')->value('source') ?? 'CACHE',
            ],
        ]);
    }

    // =========================================================================
    // STORE
    // =========================================================================

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'client_id'   => 'required|exists:clients,id',
            'contrat_id'  => 'required|exists:contrats_import,id',
            'devise_id'   => 'nullable|exists:devises,id',
            'date_echeance' => 'required|date|after:today',
            'type_facture'  => 'required|in:SURESTARIE,LOCATION,SERVICE,PENALITE',
            'notes'         => 'nullable|string',

            'lignes'                  => 'required|array|min:1',
            'lignes.*.service'        => 'required|string|max:200',
            'lignes.*.description'    => 'nullable|string',
            'lignes.*.quantite'       => 'required|numeric|min:0',
            'lignes.*.prix_unitaire'  => 'required|numeric|min:0',
            'lignes.*.tva_applicable' => 'required|boolean',
        ]);

        DB::beginTransaction();
        try {
            $tvaTaux   = (float) ConfigurationSysteme::getValeur('tva_rate', 0.19);
            $montantHT = 0;

            foreach ($request->lignes as $ligne) {
                $montantHT += $ligne['quantite'] * $ligne['prix_unitaire'];
            }

            $tva      = $montantHT * $tvaTaux;
            $totalTTC = $montantHT + $tva;

            // Generate invoice number
            $year          = now()->year;
            $lastNumber    = Facture::whereYear('date_emission', $year)->count() + 1;
            $numeroFacture = 'FAC-' . $year . '-' . str_pad($lastNumber, 4, '0', STR_PAD_LEFT);

            $facture = Facture::create([
                'numero_facture'    => $numeroFacture,
                'client_id'         => $request->client_id,
                'contrat_id'        => $request->contrat_id,
                'devise_id'         => $request->devise_id,
                'cree_par_user_id'  => Auth::id(),
                'type_facture'      => $request->type_facture,
                'date_emission'     => now(),
                'date_echeance'     => $request->date_echeance,
                'montant_ht'        => $montantHT,
                'tva'               => $tva,
                'montant_ttc'       => $totalTTC,
                'montant_paye'      => 0,
                'montant_restant'   => $totalTTC,
                'statut'            => 'BROUILLON',
                'notes'             => $request->notes,
            ]);

            foreach ($request->lignes as $ligne) {
                $totalHT = $ligne['quantite'] * $ligne['prix_unitaire'];
                LigneFacture::create([
                    'facture_id'     => $facture->id,
                    'service'        => $ligne['service'],
                    'description'    => $ligne['description'] ?? null,
                    'quantite'       => $ligne['quantite'],
                    'prix_unitaire'  => $ligne['prix_unitaire'],
                    'tva_applicable' => $ligne['tva_applicable'],
                    'total_ht'       => $totalHT,
                ]);
            }

            DB::commit();

            $this->audit('CREATE', 'factures', $facture->id, null, $facture->toArray());

            return response()->json([
                'message' => 'Facture créée avec succès.',
                'facture' => $facture->load('lignes'),
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Erreur : ' . $e->getMessage()], 500);
        }
    }

    // =========================================================================
    // EMIT — set to EMISE, notify client
    // =========================================================================

    public function emit(int $id): JsonResponse
    {
        $facture = Facture::with('client')->findOrFail($id);

        if ($facture->statut !== 'BROUILLON') {
            return response()->json(['message' => 'Seules les factures en brouillon peuvent être émises.'], 422);
        }

        $old = $facture->toArray();
        $facture->update(['statut' => 'EMISE']);

        Notification::create([
            'destinataire_id' => $facture->client->user_id,
            'facture_id'      => $facture->id,
            'titre'           => 'Nouvelle facture',
            'message'         => 'La facture ' . $facture->numero_facture . ' d\'un montant de ' . number_format($facture->montant_ttc, 2) . ' DZD est disponible. Échéance : ' . $facture->date_echeance->format('d/m/Y') . '.',
            'canal'           => 'EMAIL',
            'lu'              => false,
            'date_creation'   => now(),
        ]);

        $this->audit('UPDATE', 'factures', $facture->id, $old, ['statut' => 'EMISE']);

        return response()->json([
            'message' => 'Facture émise et client notifié.',
            'facture' => $facture->fresh(),
        ]);
    }

    // =========================================================================
    // RECORD PAYMENT
    // =========================================================================

    public function recordPayment(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'montant'       => 'required|numeric|min:0.01',
            'date_paiement' => 'required|date',
            'methode'       => 'required|in:VIREMENT,CHEQUE,ESPECES,CARTE',
            'reference'     => 'nullable|string|max:100',
            'banque_id'     => 'nullable|exists:banques,id',
            'notes'         => 'nullable|string',
        ]);

        $facture = Facture::findOrFail($id);

        if ($facture->statut === 'PAYEE') {
            return response()->json(['message' => 'Cette facture est déjà entièrement payée.'], 422);
        }

        if ($request->montant > $facture->montant_restant) {
            return response()->json([
                'message' => 'Le montant saisi (' . $request->montant . ') dépasse le restant dû (' . $facture->montant_restant . ').',
            ], 422);
        }

        DB::beginTransaction();
        try {
            // Create payment record
            Paiement::create([
                'facture_id'      => $facture->id,
                'banque_id'       => $request->banque_id,
                'recu_par_user_id'=> Auth::id(),
                'montant'         => $request->montant,
                'date_paiement'   => $request->date_paiement,
                'methode'         => $request->methode,
                'reference'       => $request->reference,
                'statut'          => 'CONFIRME',
                'notes'           => $request->notes,
            ]);

            // Update invoice totals
            $newMontantPaye    = $facture->montant_paye + $request->montant;
            $newMontantRestant = $facture->montant_ttc - $newMontantPaye;
            $newStatut         = $newMontantRestant <= 0 ? 'PAYEE' : 'PARTIELLEMENT_PAYEE';

            $old = $facture->toArray();
            $facture->update([
                'montant_paye'    => $newMontantPaye,
                'montant_restant' => max(0, $newMontantRestant),
                'statut'          => $newStatut,
            ]);

            DB::commit();

            $this->audit('UPDATE', 'factures', $facture->id, $old, $facture->fresh()->toArray());

            return response()->json([
                'message'         => $newStatut === 'PAYEE' ? 'Facture entièrement payée.' : 'Paiement partiel enregistré.',
                'facture'         => $facture->fresh(),
                'montant_restant' => max(0, $newMontantRestant),
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Erreur : ' . $e->getMessage()], 500);
        }
    }

    // =========================================================================
    // LEGAL ACTION — mise en demeure after 30 days overdue
    // =========================================================================

    public function legalAction(int $id): JsonResponse
    {
        $facture    = Facture::findOrFail($id);
        $legalDays  = (int) ConfigurationSysteme::getValeur('invoice_overdue_legal_days', 30);
        $threshold  = today()->subDays($legalDays);

        if ($facture->date_echeance > $threshold) {
            return response()->json([
                'message' => "La mise en demeure n'est disponible qu'après {$legalDays} jours de retard.",
            ], 422);
        }

        if ($facture->statut === 'CONTENTIEUX') {
            return response()->json(['message' => 'Une mise en demeure a déjà été générée.'], 422);
        }

        $old = $facture->toArray();
        $facture->update(['statut' => 'CONTENTIEUX']);

        $this->audit('UPDATE', 'factures', $facture->id, $old, ['statut' => 'CONTENTIEUX']);

        return response()->json([
            'message' => 'Facture passée en contentieux. Mise en demeure générée.',
            'facture' => $facture->fresh(),
        ]);
    }

    // =========================================================================
    // PAYMENTS LIST
    // =========================================================================

    public function payments(Request $request): JsonResponse
    {
        $query = Paiement::with(['facture.client', 'banque', 'recuPar'])
            ->orderByDesc('date_paiement');

        if ($request->filled('facture_id')) {
            $query->where('facture_id', $request->facture_id);
        }

        if ($request->filled('methode')) {
            $query->where('methode', $request->methode);
        }

        return response()->json($query->paginate(20));
    }
}
