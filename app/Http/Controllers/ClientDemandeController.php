<?php

// =============================================================================
// FILE: app/Http/Controllers/ClientDemandeController.php
// =============================================================================

namespace App\Http\Controllers;

use App\Http\Controllers\Traits\Auditable;
use App\Models\Client;
use App\Models\DemandeImport;
use App\Models\LigneDemande;
use App\Models\Transitaire;
use App\Models\Notification;
use App\Models\TypeConteneur;
use App\Models\Pays;
use App\Models\Port;
use App\Models\Marchandise;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class ClientDemandeController extends Controller
{
    use Auditable;

    private function getClient(): Client
    {
        return Client::where('user_id', Auth::id())->firstOrFail();
    }

    // =========================================================================
    // INDEX — client's own demands only
    // =========================================================================

    public function index(): JsonResponse
    {
        $client   = $this->getClient();
        $demandes = DemandeImport::where('client_id', $client->id)
            ->with(['portOrigine', 'portDestination', 'lignes'])
            ->orderByDesc('created_at')
            ->paginate(10);

        return response()->json($demandes);
    }

    // =========================================================================
    // CREATE — return form data for the 6-section wizard
    // =========================================================================

    public function create(): JsonResponse
    {
        return response()->json([
            'types_conteneur' => TypeConteneur::where('actif', true)->get(['id', 'code_type', 'libelle', 'tarif_journalier_defaut']),
            'pays'            => Pays::where('actif', true)->orderBy('nom_pays')->get(['id', 'nom_pays', 'code_iso']),
            'ports'           => Port::where('actif', true)->orderBy('nom_port')->get(['id', 'nom_port', 'code_port', 'pays_id']),
            'marchandises'    => Marchandise::where('actif', true)->orderBy('nom')->get(['id', 'nom', 'code_sh']),
        ]);
    }

    // =========================================================================
    // STORE — client submits import demand
    // =========================================================================

    public function store(Request $request): JsonResponse
    {
        $client = $this->getClient();

        $request->validate([
            'port_origine_id'          => 'required|exists:ports,id',
            'port_destination_id'      => 'required|exists:ports,id',
            'type_achat'               => 'required|in:FOB,CIF,EXW,DAP',
            'priorite'                 => 'required|in:NORMALE,HAUTE,URGENTE',
            'date_livraison_souhaitee' => 'required|date|after:today',
            'notes_client'             => 'nullable|string|max:2000',
            'transitaire_nom'          => 'nullable|string|max:200',
            'transitaire_id'           => 'nullable|exists:transitaires,id',

            'lignes'                       => 'required|array|min:1',
            'lignes.*.type_conteneur_id'   => 'required|exists:types_conteneur,id',
            'lignes.*.marchandise_id'      => 'nullable|exists:marchandises,id',
            'lignes.*.pays_origine_id'     => 'required|exists:pays,id',
            'lignes.*.quantite'            => 'required|integer|min:1',
            'lignes.*.poids_total'         => 'nullable|numeric',
            'lignes.*.volume'              => 'nullable|numeric',
            'lignes.*.description'         => 'nullable|string',
        ]);

        DB::beginTransaction();
        try {
            // Handle transitaire
            $transitaireId = $request->transitaire_id;
            if (! $transitaireId && $request->filled('transitaire_nom')) {
                $transitaire   = Transitaire::create(['nom' => $request->transitaire_nom, 'statut' => 'EN_ATTENTE_VALIDATION']);
                $transitaireId = $transitaire->id;
            }

            // Generate dossier number
            $year          = now()->year;
            $lastNumber    = DemandeImport::whereYear('created_at', $year)->count() + 1;
            $numeroDossier = 'GSLC-' . $year . '-' . str_pad($lastNumber, 4, '0', STR_PAD_LEFT);

            $demande = DemandeImport::create([
                'client_id'               => $client->id,
                'transitaire_id'          => $transitaireId,
                'port_origine_id'         => $request->port_origine_id,
                'port_destination_id'     => $request->port_destination_id,
                'numero_dossier'          => $numeroDossier,
                'type_achat'              => $request->type_achat,
                'priorite'                => $request->priorite,
                'date_soumission'         => now(),
                'date_livraison_souhaitee'=> $request->date_livraison_souhaitee,
                'statut'                  => 'EN_ETUDE',
                'notes_client'            => $request->notes_client,
                'nombre_negociations'     => 0,
            ]);

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

            // Notify all commercial users
            $commerciaux = \App\Models\User::whereHas('role', fn($q) => $q->where('label', 'commercial'))->get();
            foreach ($commerciaux as $commercial) {
                Notification::create([
                    'destinataire_id' => $commercial->id,
                    'demande_id'      => $demande->id,
                    'titre'           => 'Nouvelle demande d\'import',
                    'message'         => 'Le client ' . $client->raison_sociale . ' a soumis une nouvelle demande (' . $numeroDossier . ').',
                    'canal'           => 'SYSTEME',
                    'lu'              => false,
                    'date_creation'   => now(),
                ]);
            }

            DB::commit();

            $this->audit('CREATE', 'demandes_import', $demande->id, null, $demande->toArray());

            return response()->json([
                'message' => 'Demande soumise avec succès. Notre équipe commerciale vous contactera sous 48h.',
                'demande' => $demande->load('lignes'),
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Erreur : ' . $e->getMessage()], 500);
        }
    }

    // =========================================================================
    // SHOW — scoped to client
    // =========================================================================

    public function show(int $id): JsonResponse
    {
        $client  = $this->getClient();
        $demande = DemandeImport::where('client_id', $client->id)
            ->with(['portOrigine', 'portDestination', 'lignes.typeConteneur', 'lignes.marchandise', 'devis'])
            ->findOrFail($id);

        return response()->json($demande);
    }
}
