<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Client;
use App\Models\Role;
use App\Http\Controllers\Traits\Auditable;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    use Auditable;

    // =========================================================================
    // LOGIN
    // =========================================================================

    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::with('role')->where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            if ($user) {
                $user->increment('tentatives_echouees');
            }
            throw ValidationException::withMessages([
                'email' => ['Email ou mot de passe incorrect.'],
            ]);
        }

        if ($user->statut !== 'ACTIF') {
            return response()->json([
                'message' => match($user->statut) {
                    'EN_ATTENTE_VALIDATION' => 'Votre compte est en attente de validation par l\'administrateur.',
                    'SUSPENDU'              => 'Votre compte a été suspendu. Contactez l\'administrateur.',
                    'REJETE'                => 'Votre demande d\'inscription a été rejetée.',
                    default                 => 'Votre compte est inactif.',
                },
            ], 403);
        }

        $user->update([
            'tentatives_echouees' => 0,
            'derniere_connexion'  => now(),
        ]);

        $request->session()->regenerate();
        Auth::login($user);

        // Use Auditable trait — correct column names
        $this->audit('LOGIN', 'users', $user->id, null, [
            'email' => $user->email,
            'role'  => $user->role->label,
        ]);

        $redirectTo = match($user->role->label) {
            'admin'      => '/admin/dashboard',
            'directeur'  => '/director/dashboard',
            'commercial' => '/commercial/dashboard',
            'logistique' => '/logistics/dashboard',
            'financier'  => '/finance/dashboard',
            'client'     => '/client/dashboard',
            default      => '/dashboard',
        };

        return response()->json([
            'message'     => 'Connexion réussie.',
            'user'        => [
                'id'      => $user->id,
                'nom'     => $user->nom,
                'prenom'  => $user->prenom,
                'email'   => $user->email,
                'statut'  => $user->statut,
                'role'    => [
                    'id'    => $user->role->id,
                    'label' => $user->role->label,
                    'nom'   => $user->role->nom_role,
                ],
            ],
            'redirect_to' => $redirectTo,
        ], 200);
    }

    // =========================================================================
    // LOGOUT
    // =========================================================================

    public function logout(Request $request): JsonResponse
    {
        if (Auth::check()) {
            $this->audit('LOGOUT', 'users', Auth::id());
        }

        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json(['message' => 'Déconnexion réussie.'], 200);
    }

    // =========================================================================
    // CURRENT USER
    // =========================================================================

    public function me(Request $request): JsonResponse
    {
        $user = $request->user()->load('role');

        $clientProfile = null;
        if ($user->role->label === 'client') {
            $clientProfile = Client::where('user_id', $user->id)->first();
        }

        return response()->json([
            'user' => [
                'id'                 => $user->id,
                'nom'                => $user->nom,
                'prenom'             => $user->prenom,
                'email'              => $user->email,
                'statut'             => $user->statut,
                'derniere_connexion' => $user->derniere_connexion,
                'role'               => [
                    'id'    => $user->role->id,
                    'label' => $user->role->label,
                    'nom'   => $user->role->nom_role,
                ],
                'client_profile'     => $clientProfile,
            ],
        ], 200);
    }

    // =========================================================================
    // REGISTER
    // =========================================================================

    public function register(Request $request): JsonResponse
    {
        $request->validate([
            'nom'            => 'required|string|max:100',
            'prenom'         => 'required|string|max:100',
            'email'          => 'required|email|unique:users,email',
            'password'       => 'required|string|min:8|confirmed',
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

        $clientRole = Role::where('label', 'client')->firstOrFail();

        $user = User::create([
            'nom'                 => $request->nom,
            'prenom'              => $request->prenom,
            'email'               => $request->email,
            'password'            => Hash::make($request->password),
            'role_id'             => $clientRole->id,
            'statut'              => 'EN_ATTENTE_VALIDATION',
            'tentatives_echouees' => 0,
        ]);

        $client = Client::create([
            'user_id'          => $user->id,
            'raison_sociale'   => $request->raison_sociale,
            'nif'              => $request->nif,
            'nis'              => $request->nis,
            'rc'               => $request->rc,
            'adresse_siege'    => $request->adresse_siege,
            'ville'            => $request->ville,
            'pays_id'          => $request->pays_id,
            'type_client'      => $request->type_client,
            'rep_nom'          => $request->rep_nom,
            'rep_prenom'       => $request->rep_prenom,
            'rep_role'         => $request->rep_role,
            'rep_tel'          => $request->rep_tel,
            'rep_email'        => $request->rep_email,
            'rep_adresse_perso'=> $request->rep_adresse_perso ?? null,
            'statut'           => 'EN_ATTENTE_VALIDATION',
        ]);

        $this->audit('CREATE', 'users', $user->id, null, [
            'email'          => $user->email,
            'raison_sociale' => $request->raison_sociale,
        ]);

        return response()->json([
            'message' => 'Inscription soumise avec succès. Votre compte sera activé après validation par notre équipe.',
            'user_id' => $user->id,
        ], 201);
    }
}
