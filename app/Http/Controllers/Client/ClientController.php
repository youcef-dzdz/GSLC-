<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Traits\Auditable;
use App\Http\Requests\Commercial\StoreClientRequest;
use App\Http\Requests\Commercial\UpdateClientRequest;
use App\Models\Client;
use App\Models\Notification;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class ClientController extends Controller
{
    use Auditable;

    // =========================================================================
    // INDEX
    // =========================================================================

    public function index(Request $request): JsonResponse
    {
        $query = Client::with(['user:id,nom,prenom,email', 'pays:id,nom_pays,code_iso'])
            ->orderByDesc('created_at');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(fn($q) => $q
                ->where('raison_sociale', 'like', "%{$search}%")
                ->orWhere('nif',          'like', "%{$search}%")
                ->orWhere('ville',        'like', "%{$search}%")
                ->orWhere('rep_nom',      'like', "%{$search}%")
                ->orWhere('rep_email',    'like', "%{$search}%")
            );
        }

        if ($request->filled('statut')) {
            $query->where('statut', $request->statut);
        }

        if ($request->filled('type_client')) {
            $query->where('type_client', $request->type_client);
        }

        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        return response()->json($query->paginate(20));
    }

    // =========================================================================
    // SHOW
    // =========================================================================

    public function show(Client $client): JsonResponse
    {
        $client->load(['user:id,nom,prenom,email', 'pays:id,nom_pays,code_iso', 'validePar:id,nom,prenom']);

        $derniersDossiers = $client->demandes()
            ->orderByDesc('created_at')
            ->limit(5)
            ->get(['id', 'numero_dossier', 'statut', 'created_at']);

        $stats = [
            'total_contrats' => $client->contrats()->count(),
            'total_facture'  => (float) $client->factures()->sum('montant_ttc'),
            'total_paye'     => (float) $client->factures()->sum('montant_paye'),
            'solde_restant'  => (float) $client->factures()->sum('montant_restant'),
        ];

        return response()->json([
            'client'            => $client,
            'derniers_dossiers' => $derniersDossiers,
            'stats'             => $stats,
        ]);
    }

    // =========================================================================
    // STORE
    // =========================================================================

    public function store(StoreClientRequest $request): JsonResponse
    {
        $data = $request->validated();

        $result = DB::transaction(function () use ($data) {
            $tempPassword = Str::random(12);

            $clientRole = Role::where('label', 'client')->firstOrFail();

            $user = User::create([
                'nom'                 => $data['rep_nom'],
                'prenom'              => $data['rep_prenom'],
                'email'               => $data['rep_email'],
                'password'            => Hash::make($tempPassword),
                'role_id'             => $clientRole->id,
                'statut'              => 'ACTIF',
                'tentatives_echouees' => 0,
            ]);

            $client = Client::create([
                'user_id'            => $user->id,
                'raison_sociale'     => $data['raison_sociale'],
                'nif'                => $data['nif'],
                'nis'                => $data['nis'],
                'rc'                 => $data['rc'],
                'adresse_siege'      => $data['adresse_siege'],
                'ville'              => $data['ville'],
                'pays_id'            => $data['pays_id'],
                'type_client'        => $data['type_client'],
                'rep_nom'            => $data['rep_nom'],
                'rep_prenom'         => $data['rep_prenom'],
                'rep_role'           => $data['rep_role'],
                'rep_tel'            => $data['rep_tel'],
                'rep_email'          => $data['rep_email'],
                'rep_adresse_perso'  => $data['rep_adresse_perso'] ?? null,
                'statut'             => 'APPROUVE',
                'valide_par_user_id' => auth()->id(),
                'date_validation'    => now(),
            ]);

            Notification::create([
                'destinataire_id' => $user->id,
                'titre'           => 'Compte créé — accès GSLC',
                'message'         => 'Votre compte a été créé par notre équipe commerciale. '
                                   . 'Email : ' . $user->email . ' | '
                                   . 'Mot de passe temporaire : ' . $tempPassword,
                'canal'           => 'EMAIL',
                'lu'              => false,
                'date_creation'   => now(),
            ]);

            return $client;
        });

        $this->audit('CREATE', 'clients', $result->id, null, $result->toArray());

        return response()->json($result->load(['pays:id,nom_pays', 'user:id,nom,prenom,email']), 201);
    }

    // =========================================================================
    // UPDATE
    // =========================================================================

    public function update(UpdateClientRequest $request, Client $client): JsonResponse
    {
        $old  = $client->toArray();
        $data = $request->validated();

        // When approving/rejecting, record who validated
        if (isset($data['statut']) && in_array($data['statut'], ['APPROUVE', 'REJETE'])) {
            $data['valide_par_user_id'] = auth()->id();
            $data['date_validation']    = now();
        }

        $client->update($data);

        $this->audit('UPDATE', 'clients', $client->id, $old, $client->fresh()->toArray());

        return response()->json($client->fresh()->load(['pays:id,nom_pays', 'user:id,nom,prenom,email', 'validePar:id,nom,prenom']));
    }

    // =========================================================================
    // DESTROY
    // =========================================================================

    public function destroy(Client $client): JsonResponse
    {
        if ($client->demandes()->exists()) {
            return response()->json([
                'message' => 'Impossible de supprimer ce client : des demandes d\'import lui sont associées.',
            ], 422);
        }

        if ($client->contrats()->exists()) {
            return response()->json([
                'message' => 'Impossible de supprimer ce client : des contrats lui sont associés.',
            ], 422);
        }

        if ($client->factures()->exists()) {
            return response()->json([
                'message' => 'Impossible de supprimer ce client : des factures lui sont associées.',
            ], 422);
        }

        $this->audit('DELETE', 'clients', $client->id, $client->toArray(), null);

        $client->delete();

        return response()->json(['message' => 'Client supprimé avec succès.']);
    }
}
