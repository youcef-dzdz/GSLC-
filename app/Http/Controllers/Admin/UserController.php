<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Traits\Auditable;
use App\Models\User;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserController extends Controller
{
    use Auditable;

    // =========================================================================
    // LIST — GET /api/admin/users
    // Supports: search (name/email), filter by role_id, filter by statut, paginate
    // =========================================================================

    public function index(Request $request): JsonResponse
    {
        $query = User::with('role')->orderByDesc('created_at');

        // Search by name or email
        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('nom', 'ilike', "%{$s}%")
                  ->orWhere('prenom', 'ilike', "%{$s}%")
                  ->orWhere('email', 'ilike', "%{$s}%");
            });
        }

        // Filter by role
        if ($request->filled('role_id')) {
            $query->where('role_id', $request->role_id);
        }

        // Filter by status
        if ($request->filled('statut')) {
            $query->where('statut', $request->statut);
        }

        $users = $query->paginate(20);

        // Format each user for the frontend
        $users->getCollection()->transform(fn($u) => [
            'id'                  => $u->id,
            'nom'                 => $u->nom,
            'prenom'              => $u->prenom,
            'email'               => $u->email,
            'position'            => $u->position,
            'statut'              => $u->statut,
            'tentatives_echouees' => $u->tentatives_echouees,
            'derniere_connexion'  => $u->derniere_connexion,
            'created_at'          => $u->created_at,
            'role'                => $u->role ? [
                'id'    => $u->role->id,
                'label' => $u->role->label,
                'nom'   => $u->role->nom_role,
            ] : null,
        ]);

        return response()->json($users);
    }

    // =========================================================================
    // CREATE — POST /api/admin/users
    // Admin creates a staff account and assigns a role.
    // A temporary password is auto-generated and returned once.
    // =========================================================================

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'nom'      => 'required|string|max:100',
            'prenom'   => 'required|string|max:100',
            'email'    => 'required|email|unique:users,email',
            'role_id'  => 'required|exists:roles,id',
            'position' => 'nullable|string|max:150',
        ]);

        // Generate a 12-character temporary password
        $tempPassword = Str::password(12, letters: true, numbers: true, symbols: false);

        $user = User::create([
            'nom'                 => $request->nom,
            'prenom'              => $request->prenom,
            'email'               => $request->email,
            'password'            => Hash::make($tempPassword),
            'role_id'             => $request->role_id,
            'position'            => $request->position,
            'statut'              => 'ACTIF',
            'tentatives_echouees' => 0,
        ]);

        $this->audit('CREATE', 'users', $user->id, null, [
            'email'    => $user->email,
            'role_id'  => $user->role_id,
            'position' => $user->position,
        ]);

        return response()->json([
            'message'       => 'Compte créé avec succès.',
            'user'          => $user->load('role'),
            'temp_password' => $tempPassword, // shown once to admin, never stored in plain text
        ], 201);
    }

    // =========================================================================
    // UPDATE — PUT /api/admin/users/{id}
    // Admin can change: name, role, position, statut
    // =========================================================================

    public function update(Request $request, int $id): JsonResponse
    {
        $user = User::findOrFail($id);

        $request->validate([
            'nom'      => 'sometimes|string|max:100',
            'prenom'   => 'sometimes|string|max:100',
            'email'    => 'sometimes|email|unique:users,email,' . $id,
            'role_id'  => 'sometimes|exists:roles,id',
            'position' => 'nullable|string|max:150',
            'statut'   => 'sometimes|in:ACTIF,INACTIF,SUSPENDU,VERROUILLE',
        ]);

        $old = $user->toArray();

        $user->update($request->only(['nom', 'prenom', 'email', 'role_id', 'position', 'statut']));

        $this->audit('UPDATE', 'users', $user->id, $old, $user->fresh()->toArray());

        return response()->json([
            'message' => 'Utilisateur mis à jour.',
            'user'    => $user->fresh()->load('role'),
        ]);
    }

    // =========================================================================
    // DELETE — DELETE /api/admin/users/{id}
    // =========================================================================

    public function destroy(int $id): JsonResponse
    {
        $user = User::findOrFail($id);
        $old  = $user->toArray();

        $user->delete();

        $this->audit('DELETE', 'users', $id, $old, null);

        return response()->json(['message' => 'Utilisateur supprimé.']);
    }

    // =========================================================================
    // BLOCK / UNBLOCK — POST /api/admin/users/{id}/block
    // Toggles between VERROUILLE and ACTIF
    // =========================================================================

    public function block(int $id): JsonResponse
    {
        $user = User::findOrFail($id);
        $old  = $user->toArray();

        $newStatut = $user->statut === 'VERROUILLE' ? 'ACTIF' : 'VERROUILLE';
        $user->update([
            'statut'              => $newStatut,
            'tentatives_echouees' => $newStatut === 'ACTIF' ? 0 : $user->tentatives_echouees,
        ]);

        $this->audit('UPDATE', 'users', $user->id, $old, $user->fresh()->toArray());

        return response()->json([
            'message' => $newStatut === 'VERROUILLE'
                ? 'Compte verrouillé.'
                : 'Compte déverrouillé.',
            'statut'  => $newStatut,
        ]);
    }

    // =========================================================================
    // RESET PASSWORD — POST /api/admin/users/{id}/reset-password
    // Generates a new temporary password, returns it once to the admin
    // =========================================================================

    public function resetPassword(int $id): JsonResponse
    {
        $user = User::findOrFail($id);

        $tempPassword = Str::password(12, letters: true, numbers: true, symbols: false);
        $user->update(['password' => Hash::make($tempPassword)]);

        $this->audit('UPDATE', 'users', $user->id, ['password' => '***'], ['password' => '*** (reset)']);

        return response()->json([
            'message'       => 'Mot de passe réinitialisé.',
            'temp_password' => $tempPassword,
        ]);
    }

    // =========================================================================
    // GET ALL ROLES — GET /api/admin/roles
    // Used to populate the role dropdown in the create/edit form
    // =========================================================================

    public function roles(): JsonResponse
    {
        $roles = Role::orderBy('niveau')->get(['id', 'nom_role', 'label', 'niveau']);
        return response()->json($roles);
    }
}
