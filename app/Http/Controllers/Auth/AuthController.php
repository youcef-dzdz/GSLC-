<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;

use App\Models\User;
use App\Models\Client;
use App\Models\Role;
use App\Http\Controllers\Traits\Auditable;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Password;

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

        $user = User::with(['role.permissions:id,name,module'])->where('email', $request->email)->first();

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

        // Revoke old tokens, issue a fresh one
        $user->tokens()->delete();
        $token = $user->createToken('api-token')->plainTextToken;

        $this->audit('LOGIN', 'users', $user->id, null, [
            'email' => $user->email,
            'role'  => $user->role->label,
        ], 'SUCCES', $user->id);

        $redirectTo = match($user->role->label) {
            'admin'      => '/admin/dashboard',
            'directeur'  => '/director/dashboard',
            'commercial' => '/commercial/dashboard',
            'logistique' => '/logistics/dashboard',
            'financier'  => '/finance/dashboard',
            'client'     => '/client/dashboard',
            'it_agent'   => '/admin/dashboard',
            default      => '/admin/dashboard',
        };

        return response()->json([
            'message'     => 'Connexion réussie.',
            'token'       => $token,
            'user'        => [
                'id'                   => $user->id,
                'nom'                  => $user->nom,
                'prenom'               => $user->prenom,
                'email'                => $user->email,
                'statut'               => $user->statut,
                'must_change_password' => (bool) $user->must_change_password,
                'role'                 => [
                    'id'          => $user->role->id,
                    'label'       => $user->role->label,
                    'nom'         => $user->role->nom_role,
                    'permissions' => $user->role->permissions->pluck('name')->toArray(),
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
        $user = $request->user();

        if ($user) {
            $this->audit('LOGOUT', 'users', $user->id);
            $user->currentAccessToken()->delete();
        }

        return response()->json(['message' => 'Déconnexion réussie.'], 200);
    }

    // =========================================================================
    // CURRENT USER
    // =========================================================================

    public function me(Request $request): JsonResponse
    {
        $user = $request->user()->load(['role.permissions:id,name,module']);

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
                    'id'          => $user->role->id,
                    'label'       => $user->role->label,
                    'nom'         => $user->role->nom_role,
                    'permissions' => $user->role->permissions->pluck('name')->toArray(),
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

    // =========================================================================
    // FORGOT PASSWORD
    // =========================================================================

    public function forgotPassword(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $user = User::where('email', $request->email)->first();

        // Always return 200 so we don't leak if an email exists
        if (! $user || $user->statut !== 'ACTIF') {
            return response()->json([
                'message' => 'Si cet email correspond à un compte actif, un lien de réinitialisation a été envoyé.'
            ], 200);
        }

        // Generate token manually
        $token = Password::createToken($user);

        // Build React reset URL
        $resetUrl = 'http://localhost:5173/reset-password?token=' . $token . '&email=' . urlencode($user->email);

        // Send email using Mail::raw()
        \Mail::raw("Bonjour,\n\nCliquez sur ce lien pour réinitialiser votre mot de passe :\n\n" . $resetUrl . "\n\nCe lien expire dans 60 minutes.\n\nSi vous n'avez pas demandé cette réinitialisation, ignorez cet email.", function($message) use ($user) {
            $message->to($user->email)
                    ->subject('Réinitialisation de votre mot de passe - NASHCO/GSLC');
        });

        $this->audit('SYSTEM', 'users', $user->id, null, [
            'action' => 'reinitialisation_mot_de_passe_envoyee',
            'email'  => $request->email,
        ]);

        return response()->json([
            'message' => 'Un lien de réinitialisation a été envoyé à votre adresse e-mail.'
        ], 200);
    }
    public function resetPassword(Request $request): JsonResponse
    {
        $request->validate([
            'token'                 => 'required',
            'email'                 => 'required|email',
            'password'              => 'required|min:8|confirmed',
        ]);

        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user, $password) {
                $user->forceFill(['password' => bcrypt($password)])->save();
            }
        );

        if ($status === Password::PASSWORD_RESET) {
            return response()->json(['message' => 'Mot de passe réinitialisé avec succès.'], 200);
        }

        return response()->json(['message' => 'Lien invalide ou expiré.'], 400);
    }

    // =========================================================================
    // CHANGE PASSWORD (forced — must_change_password = true)
    // POST /api/staff/change-password   middleware: auth:sanctum
    // =========================================================================

    public function changePassword(Request $request): JsonResponse
    {
        $request->validate([
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = auth()->user();

        $user->update([
            'password'             => Hash::make($request->password),
            'must_change_password' => false,
        ]);

        // Alerte sécurité à l'admin — le staff a changé son mot de passe
        try {
            \Illuminate\Support\Facades\Mail::queue(
                new \App\Mail\StaffPasswordResetAlert(
                    $user,
                    $request->ip() ?? '127.0.0.1'
                )
            );
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error(
                'StaffPasswordResetAlert email failed: ' . $e->getMessage()
            );
        }

        // Notification bell pour les admins
        $adminIds = \App\Models\User::whereHas('role',
            fn($q) => $q->where('label', 'admin')
        )->pluck('id');

        foreach ($adminIds as $adminId) {
            \App\Models\Notification::create([
                'destinataire_id' => $adminId,
                'titre'           => 'Mot de passe modifié',
                'message'         => $user->prenom . ' ' . $user->nom
                                     . ' a changé son mot de passe.',
                'canal'           => 'SYSTEME',
                'lien_action'     => '/admin/users',
                'lu'              => false,
                'date_creation'   => now(),
            ]);
        }

        return response()->json(['message' => 'Mot de passe mis à jour.']);
    }
}
