<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Traits\Auditable;
use App\Models\DemandeImport;
use App\Models\LigneDemande;
use App\Models\Transitaire;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class DemandeImportController extends Controller
{
    use Auditable;

    // =========================================================================
    // INDEX
    // =========================================================================

    public function index(Request $request): JsonResponse
    {
        $query = DemandeImport::with(['client', 'transitaire', 'portOrigine', 'portDestination'])
            ->orderByDesc('created_at');

        if ($request->filled('statut')) {
            $query->where('statut', $request->statut);
        }

        if ($request->filled('priorite')) {
            $query->where('priorite', $request->priorite);
        }

        if ($request->filled('client_id')) {
            $query->where('client_id', $request->client_id);
        }

        if ($request->filled('date_debut')) {
            $query->whereDate('date_soumission', '>=', $request->date_debut);
        }

        if ($request->filled('date_fin')) {
            $query->whereDate('date_soumission', '<=', $request->date_fin);
        }

        $demandes = $query->paginate(20);

        $demandes->getCollection()->transform(fn($d) => [
            'id'                      => $d->id,
            'numero_dossier'          => $d->numero_dossier,
            'client'                  => $d->client?->raison_sociale,
            'client_id'               => $d->client_id,
            'port_origine'            => $d->portOrigine?->nom_port,
            'port_destination'        => $d->portDestination?->nom_port,
            'statut'                  => $d->statut,
            'priorite'                => $d->priorite,
            'type_achat'              => $d->type_achat,
            'date_soumission'         => $d->date_soumission,
            'date_livraison_souhaitee'=> $d->date_livraison_souhaitee,
            'nombre_negociations'     => $d->nombre_negociations,
            'created_at'              => $d->created_at,
        ]);

        return response()->json($demandes);
    }

    // =========================================================================
    // SHOW
    // =========================================================================

    public function show(int $id): JsonResponse
    {
        $demande = DemandeImport::with([
            'client',
            'transitaire',
            'portOrigine',
            'portDestination',
            'lignes.typeConteneur',
            'lignes.marchandise',
            'lignes.paysOrigine',
            'devis',
            'documents',
            'traitePar',
        ])->findOrFail($id);

        return response()->json($demande);
    }

    // =========================================================================
    // STORE
    // =========================================================================

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'client_id'               => 'required|exists:clients,id',
            'port_origine_id'         => 'required|exists:ports,id',
            'port_destination_id'     => 'required|exists:ports,id',
            'type_achat'              => 'required|in:FOB,CIF,EXW,DAP',
            'priorite'                => 'required|in:NORMALE,HAUTE,URGENTE',
            'date_livraison_souhaitee'=> 'required|date|after:today',
            'notes_client'            => 'nullable|string',

            // Transitaire
            'transitaire_nom'         => 'nullable|string|max:200',
            'transitaire_id'          => 'nullable|exists:transitaires,id',

            // Lines (at least 1)
            'lignes'                          => 'required|array|min:1',
            'lignes.*.type_conteneur_id'      => 'required|exists:types_conteneur,id',
            'lignes.*.marchandise_id'         => 'nullable|exists:marchandises,id',
            'lignes.*.pays_origine_id'        => 'required|exists:pays,id',
            'lignes.*.quantite'               => 'required|integer|min:1',
            'lignes.*.poids_total'            => 'nullable|numeric',
            'lignes.*.volume'                 => 'nullable|numeric',
            'lignes.*.description'            => 'nullable|string',
        ]);

        DB::beginTransaction();
        try {
            // Handle transitaire — create if new, use existing if ID provided
            $transitaireId = $request->transitaire_id;
            if (! $transitaireId && $request->filled('transitaire_nom')) {
                $transitaire = Transitaire::create([
                    'nom'    => $request->transitaire_nom,
                    'statut' => 'EN_ATTENTE_VALIDATION',
                ]);
                $transitaireId = $transitaire->id;
            }

            // Generate dossier number: GSLC-YYYY-NNNN
            $year       = now()->year;
            $lastNumber = DemandeImport::whereYear('created_at', $year)->count() + 1;
            $numeroDossier = 'GSLC-' . $year . '-' . str_pad($lastNumber, 4, '0', STR_PAD_LEFT);

            // Create the demand
            $demande = DemandeImport::create([
                'client_id'               => $request->client_id,
                'transitaire_id'          => $transitaireId,
                'port_origine_id'         => $request->port_origine_id,
                'port_destination_id'     => $request->port_destination_id,
                'traite_par_user_id'      => auth()->id(),
                'numero_dossier'          => $numeroDossier,
                'type_achat'              => $request->type_achat,
                'priorite'                => $request->priorite,
                'date_soumission'         => now(),
                'date_livraison_souhaitee'=> $request->date_livraison_souhaitee,
                'statut'                  => 'EN_ETUDE',
                'notes_client'            => $request->notes_client,
                'nombre_negociations'     => 0,
            ]);

            // Create lines
            foreach ($request->lignes as $ligne) {
                LigneDemande::create([
                    'demande_id'       => $demande->id,
                    'type_conteneur_id'=> $ligne['type_conteneur_id'],
                    'marchandise_id'   => $ligne['marchandise_id'] ?? null,
                    'pays_origine_id'  => $ligne['pays_origine_id'],
                    'quantite'         => $ligne['quantite'],
                    'poids_total'      => $ligne['poids_total'] ?? null,
                    'volume'           => $ligne['volume'] ?? null,
                    'description'      => $ligne['description'] ?? null,
                ]);
            }

            DB::commit();

            $this->audit('CREATE', 'demandes_import', $demande->id, null, $demande->toArray());

            return response()->json([
                'message' => 'Demande créée avec succès.',
                'demande' => $demande->load(['client', 'lignes']),
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Erreur lors de la création : ' . $e->getMessage()], 500);
        }
    }

    // =========================================================================
    // UPDATE — update status only
    // =========================================================================

    public function update(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'statut'       => 'required|in:EN_ETUDE,DEVIS_ENVOYE,EN_NEGOCIATION,ACCEPTE,REFUSE,ANNULE',
            'motif_rejet'  => 'required_if:statut,REFUSE|nullable|string',
            'notes_client' => 'nullable|string',
        ]);

        $demande = DemandeImport::findOrFail($id);
        $old     = $demande->toArray();

        $demande->update([
            'statut'           => $request->statut,
            'motif_rejet'      => $request->motif_rejet ?? $demande->motif_rejet,
            'date_traitement'  => now(),
            'traite_par_user_id' => auth()->id(),
        ]);

        $this->audit('UPDATE', 'demandes_import', $demande->id, $old, $demande->fresh()->toArray());

        return response()->json([
            'message' => 'Statut de la demande mis à jour.',
            'demande' => $demande->fresh(),
        ]);
    }
}
