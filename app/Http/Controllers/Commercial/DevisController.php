<?php

namespace App\Http\Controllers\Commercial;

use App\Http\Controllers\Controller;

use App\Http\Controllers\Traits\Auditable;
use App\Models\Devis;
use App\Models\LigneDevis;
use App\Models\DemandeImport;
use App\Models\ConfigurationSysteme;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class DevisController extends Controller
{
    use Auditable;

    // =========================================================================
    // INDEX
    // =========================================================================

    public function index(Request $request): JsonResponse
    {
        $query = Devis::with(['demande.client', 'creePar'])
            ->orderByDesc('created_at');

        if ($request->filled('statut')) {
            $query->where('statut', $request->statut);
        }

        if ($request->filled('demande_id')) {
            $query->where('demande_id', $request->demande_id);
        }

        $devis = $query->paginate(20);

        $devis->getCollection()->transform(fn($d) => [
            'id'             => $d->id,
            'numero_devis'   => $d->numero_devis,
            'version'        => $d->version,
            'client'         => $d->demande?->client?->raison_sociale,
            'demande_id'     => $d->demande_id,
            'montant_ht'     => (float) $d->montant_ht,
            'tva'            => (float) $d->tva,
            'total_ttc'      => (float) $d->total_ttc,
            'statut'         => $d->statut,
            'date_envoi'     => $d->date_envoi,
            'date_expiration'=> $d->date_expiration,
            'created_at'     => $d->created_at,
        ]);

        return response()->json($devis);
    }

    // =========================================================================
    // SHOW
    // =========================================================================

    public function show(int $id): JsonResponse
    {
        $devis = Devis::with([
            'demande.client',
            'demande.lignes.typeConteneur',
            'lignes',
            'creePar',
            'devisPrecedent',
        ])->findOrFail($id);

        return response()->json($devis);
    }

    // =========================================================================
    // STORE
    // =========================================================================

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'demande_id'          => 'required|exists:demandes_import,id',
            'date_expiration'     => 'required|date|after:today',
            'commentaire_nashco'  => 'nullable|string',
            'devis_precedent_id'  => 'nullable|exists:devis,id',

            'lignes'                      => 'required|array|min:1',
            'lignes.*.service'            => 'required|string|max:200',
            'lignes.*.description'        => 'nullable|string',
            'lignes.*.quantite'           => 'required|numeric|min:0',
            'lignes.*.prix_unitaire'      => 'required|numeric|min:0',
            'lignes.*.tva_applicable'     => 'required|boolean',
            'lignes.*.type_ligne'         => 'required|in:SERVICE,TRANSPORT,FRAIS,REMISE',
            'lignes.*.tarif_service_id'   => 'nullable|exists:tarifs_service,id',
        ]);

        // Check negotiation rounds limit
        $maxRounds = (int) ConfigurationSysteme::getValeur('max_negotiation_rounds', 3);
        $demande   = DemandeImport::findOrFail($request->demande_id);

        if ($demande->nombre_negociations >= $maxRounds && $request->filled('devis_precedent_id')) {
            return response()->json([
                'message' => "Nombre maximum de rounds de négociation atteint ({$maxRounds}).",
            ], 422);
        }

        DB::beginTransaction();
        try {
            $tvaTaux = (float) ConfigurationSysteme::getValeur('tva_rate', 0.19);

            // Calculate totals from lines
            $montantHT = 0;
            foreach ($request->lignes as $ligne) {
                $total = $ligne['quantite'] * $ligne['prix_unitaire'];
                if ($ligne['type_ligne'] === 'REMISE') {
                    $montantHT -= $total;
                } else {
                    $montantHT += $total;
                }
            }

            $tva      = $montantHT * $tvaTaux;
            $totalTTC = $montantHT + $tva;

            // Version number
            $version = $request->filled('devis_precedent_id') ? $demande->nombre_negociations + 2 : 1;

            // Generate quote number
            $year        = now()->year;
            $lastNumber  = Devis::whereYear('created_at', $year)->count() + 1;
            $numeroDevis = 'DEV-' . $year . '-' . str_pad($lastNumber, 4, '0', STR_PAD_LEFT);

            $devis = Devis::create([
                'demande_id'         => $request->demande_id,
                'cree_par_user_id'   => auth()->id(),
                'devis_precedent_id' => $request->devis_precedent_id ?? null,
                'numero_devis'       => $numeroDevis,
                'version'            => $version,
                'montant_ht'         => $montantHT,
                'tva'                => $tva,
                'total_ttc'          => $totalTTC,
                'statut'             => 'ENVOYE',
                'commentaire_nashco' => $request->commentaire_nashco,
                'date_envoi'         => now(),
                'date_expiration'    => $request->date_expiration,
            ]);

            // Create lines
            foreach ($request->lignes as $ligne) {
                $totalHT = $ligne['quantite'] * $ligne['prix_unitaire'];
                LigneDevis::create([
                    'devis_id'            => $devis->id,
                    'tarif_service_id'    => $ligne['tarif_service_id'] ?? null,
                    'type_ligne'          => $ligne['type_ligne'],
                    'service'             => $ligne['service'],
                    'description'         => $ligne['description'] ?? null,
                    'quantite'            => $ligne['quantite'],
                    'prix_unitaire'       => $ligne['prix_unitaire'],
                    'tva_applicable'      => $ligne['tva_applicable'],
                    'total_ht'            => $totalHT,
                ]);
            }

            // Update demand negotiation count and status
            $demande->update([
                'statut'              => 'DEVIS_ENVOYE',
                'nombre_negociations' => $demande->nombre_negociations + 1,
            ]);

            // Notify client
            Notification::create([
                'destinataire_id' => $demande->client->user_id,
                'demande_id'      => $demande->id,
                'titre'           => 'Nouveau devis reçu',
                'message'         => 'Un devis (' . $numeroDevis . ') a été envoyé pour votre demande ' . $demande->numero_dossier . '. Veuillez le consulter et répondre.',
                'canal'           => 'SYSTEME',
                'lu'              => false,
                'date_creation'   => now(),
            ]);

            DB::commit();

            $this->audit('CREATE', 'devis', $devis->id, null, $devis->toArray());

            return response()->json([
                'message' => 'Devis créé et envoyé au client.',
                'devis'   => $devis->load('lignes'),
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Erreur : ' . $e->getMessage()], 500);
        }
    }

    // =========================================================================
    // UPDATE
    // =========================================================================

    public function update(Request $request, int $id): JsonResponse
    {
        $devis = Devis::findOrFail($id);
        $old   = $devis->toArray();

        $request->validate([
            'statut'             => 'sometimes|in:ENVOYE,EXPIRE,ANNULE',
            'commentaire_nashco' => 'sometimes|nullable|string',
        ]);

        $devis->update($request->only(['statut', 'commentaire_nashco']));

        $this->audit('UPDATE', 'devis', $devis->id, $old, $devis->fresh()->toArray());

        return response()->json([
            'message' => 'Devis mis à jour.',
            'devis'   => $devis->fresh(),
        ]);
    }
}
