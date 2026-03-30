<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Traits\Auditable;
use App\Models\Client;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ClientController extends Controller
{
    use Auditable;

    // =========================================================================
    // INDEX
    // =========================================================================

    public function index(Request $request): JsonResponse
    {
        $query = Client::with(['user', 'pays'])
            ->orderByDesc('created_at');

        if ($request->filled('statut')) {
            $query->where('statut', $request->statut);
        }

        if ($request->filled('score_risque')) {
            $query->where('score_risque', $request->score_risque);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(fn($q) => $q
                ->where('raison_sociale', 'ilike', "%{$search}%")
                ->orWhere('nif', 'ilike', "%{$search}%")
                ->orWhere('ville', 'ilike', "%{$search}%")
            );
        }

        $clients = $query->paginate(20);

        $clients->getCollection()->transform(fn($c) => [
            'id'              => $c->id,
            'raison_sociale'  => $c->raison_sociale,
            'nif'             => $c->nif,
            'ville'           => $c->ville,
            'type_client'     => $c->type_client,
            'statut'          => $c->statut,
            'score_risque'    => $c->score_risque ?? 'FAIBLE',
            'rep_nom'         => $c->rep_nom,
            'rep_prenom'      => $c->rep_prenom,
            'rep_tel'         => $c->rep_tel,
            'created_at'      => $c->created_at,
        ]);

        return response()->json($clients);
    }

    // =========================================================================
    // SHOW
    // =========================================================================

    public function show(int $id): JsonResponse
    {
        $client = Client::with(['user', 'pays', 'validePar'])->findOrFail($id);

        // Last 5 dossiers
        $derniersDossiers = $client->demandesImport()
            ->with('devis')
            ->orderByDesc('created_at')
            ->limit(5)
            ->get()
            ->map(fn($d) => [
                'id'             => $d->id,
                'numero_dossier' => $d->numero_dossier,
                'statut'         => $d->statut,
                'created_at'     => $d->created_at,
            ]);

        // Financial stats
        $stats = [
            'total_contrats'  => $client->contrats()->count(),
            'total_facture'   => (float) $client->factures()->sum('montant_ttc'),
            'total_paye'      => (float) $client->factures()->sum('montant_paye'),
            'solde_restant'   => (float) $client->factures()->sum('montant_restant'),
        ];

        return response()->json([
            'client'           => $client,
            'score_risque'     => $client->score_risque ?? 'FAIBLE',
            'derniers_dossiers'=> $derniersDossiers,
            'stats'            => $stats,
        ]);
    }

    // =========================================================================
    // STORE
    // =========================================================================

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'raison_sociale' => 'required|string|max:200',
            'nif'            => 'required|string|max:20|unique:clients,nif',
            'nis'            => 'required|string|max:20',
            'rc'             => 'required|string|max:50',
            'adresse_siege'  => 'required|string|max:255',
            'ville'          => 'required|string|max:100',
            'pays_id'        => 'required|exists:pays,id',
            'type_client'    => 'required|in:ENTREPRISE,PARTICULIER,ADMINISTRATION',
            'rep_nom'        => 'required|string|max:100',
            'rep_prenom'     => 'required|string|max:100',
            'rep_role'       => 'required|string|max:100',
            'rep_tel'        => 'required|string|max:20',
            'rep_email'      => 'required|email|max:150',
        ]);

        $client = Client::create([
            ...$request->only([
                'raison_sociale', 'nif', 'nis', 'rc',
                'adresse_siege', 'ville', 'pays_id', 'type_client',
                'rep_nom', 'rep_prenom', 'rep_role', 'rep_tel', 'rep_email',
                'rep_adresse_perso',
            ]),
            'statut'             => 'VALIDE',
            'valide_par_user_id' => auth()->id(),
            'date_validation'    => now(),
        ]);

        $this->audit('CREATE', 'clients', $client->id, null, $client->toArray());

        return response()->json([
            'message' => 'Client créé avec succès.',
            'client'  => $client->load('pays'),
        ], 201);
    }

    // =========================================================================
    // UPDATE
    // =========================================================================

    public function update(Request $request, int $id): JsonResponse
    {
        $client = Client::findOrFail($id);
        $old    = $client->toArray();

        $request->validate([
            'raison_sociale' => 'sometimes|string|max:200',
            'adresse_siege'  => 'sometimes|string|max:255',
            'ville'          => 'sometimes|string|max:100',
            'rep_tel'        => 'sometimes|string|max:20',
            'rep_email'      => 'sometimes|email|max:150',
            'statut'         => 'sometimes|in:VALIDE,SUSPENDU,BLACKLISTE',
        ]);

        $client->update($request->only([
            'raison_sociale', 'adresse_siege', 'ville',
            'rep_nom', 'rep_prenom', 'rep_role', 'rep_tel', 'rep_email',
            'rep_adresse_perso', 'statut',
        ]));

        $this->audit('UPDATE', 'clients', $client->id, $old, $client->fresh()->toArray());

        return response()->json([
            'message' => 'Client mis à jour.',
            'client'  => $client->fresh(),
        ]);
    }
}
