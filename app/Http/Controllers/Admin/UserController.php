<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Traits\Auditable;
use App\Models\User;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
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
        $query = User::with(['role', 'department'])->orderByDesc('created_at');

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

        $users = $query->get()->map(fn($u) => [
            'id'                  => $u->id,
            'nom'                 => $u->nom,
            'prenom'              => $u->prenom,
            'email'               => $u->email,
            'position'            => $u->position,
            'statut'              => $u->statut,
            'tentatives_echouees' => $u->tentatives_echouees,
            'derniere_connexion'  => $u->derniere_connexion,
            'created_at'          => $u->created_at,
            'department_id'       => $u->department_id,
            'department'          => $u->department ? [
                'id'   => $u->department->id,
                'code' => $u->department->code,
                'name' => $u->department->name,
            ] : null,
            'role'                => $u->role ? [
                'id'      => $u->role->id,
                'label'   => $u->role->label,
                'nom_role'=> $u->role->nom_role,
                'niveau'  => $u->role->niveau,
            ] : null,
        ]);

        return response()->json(['data' => $users]);
    }

    // =========================================================================
    // CREATE — POST /api/admin/users
    // Admin creates a staff account and assigns a role.
    // A temporary password is auto-generated and returned once.
    // =========================================================================

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'nom'           => 'required|string|max:100',
            'prenom'        => 'required|string|max:100',
            'email'         => 'required|email|unique:users,email',
            'password'      => 'required|string|min:6',
            'role_id'       => 'required|exists:roles,id',
            'department_id' => 'nullable|exists:departments,id',
            'statut'        => 'nullable|in:ACTIF,SUSPENDU,VERROUILLE',
        ]);

        $user = User::create([
            'nom'                 => $request->nom,
            'prenom'              => $request->prenom,
            'email'               => $request->email,
            'password'            => bcrypt($request->password),
            'role_id'             => $request->role_id,
            'department_id'       => $request->department_id,
            'position'            => $request->position,
            'statut'              => $request->statut ?? 'ACTIF',
            'tentatives_echouees' => 0,
        ]);

        $this->audit('CREATE', 'users', $user->id, null, [
            'email'         => $user->email,
            'role_id'       => $user->role_id,
            'department_id' => $user->department_id,
        ]);

        return response()->json([
            'message' => 'Compte créé avec succès.',
            'user'    => $user->load(['role', 'department']),
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
            'nom'           => 'sometimes|string|max:100',
            'prenom'        => 'sometimes|string|max:100',
            'email'         => 'sometimes|email|unique:users,email,' . $id,
            'role_id'       => 'sometimes|exists:roles,id',
            'department_id' => 'nullable|exists:departments,id',
            'position'      => 'nullable|string|max:150',
            'statut'        => 'sometimes|in:ACTIF,SUSPENDU,VERROUILLE',
            'password'      => 'nullable|string|min:6',
        ]);

        $old = $user->toArray();

        $user->fill($request->only(['nom', 'prenom', 'email', 'role_id', 'department_id', 'position', 'statut']));
        $user->save();

        if ($request->filled('password')) {
            $user->password = bcrypt($request->password);
            $user->save();
        }

        $this->audit('UPDATE', 'users', $user->id, $old, $user->fresh()->toArray());

        return response()->json([
            'message' => 'Utilisateur mis à jour.',
            'user'    => $user->fresh()->load(['role', 'department']),
        ]);
    }

    // =========================================================================
    // DELETE — DELETE /api/admin/users/{id}
    // =========================================================================

    public function destroy(int $id): JsonResponse
    {
        try {
            // Use withTrashed() to find even soft-deleted records, then force-delete
            $user = User::withTrashed()->findOrFail($id);
            $old  = $user->toArray();
            $user->forceDelete(); // permanent hard delete — email becomes reusable
            $this->audit('DELETE', 'users', $id, $old, null);
            return response()->json(['message' => 'Utilisateur supprimé définitivement']);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }

    // =========================================================================
    // BLOCK / UNBLOCK — POST /api/admin/users/{id}/block
    // Toggles between SUSPENDU and ACTIF
    // =========================================================================

    public function block(int $id): JsonResponse
    {
        $user = User::findOrFail($id);
        $user->statut = $user->statut === 'ACTIF' ? 'SUSPENDU' : 'ACTIF';
        $user->save();
        return response()->json(['statut' => $user->statut]);
    }

    // =========================================================================
    // RESET PASSWORD — POST /api/admin/users/{id}/reset-password
    // Sends a password-reset link email via Laravel's password broker.
    // =========================================================================

    public function resetPassword(Request $request, int $id): JsonResponse
    {
        $user = User::findOrFail($id);

        // If a new password is supplied by the admin, use it directly.
        // Otherwise generate a secure temporary password.
        $newPassword = $request->filled('password')
            ? $request->password
            : Str::random(10);

        $request->validate([
            'password' => 'nullable|string|min:6',
        ]);

        $user->password = Hash::make($newPassword);
        $user->save();

        $this->audit('UPDATE', 'users', $user->id, ['password' => '***'], ['password' => '*** (reset by admin)']);

        return response()->json([
            'message'      => 'Mot de passe réinitialisé avec succès.',
            'new_password' => $newPassword, // returned once so admin can communicate it
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

    // =========================================================================
    // CREATE ROLE — POST /api/admin/roles
    // Allows admin to dynamically create new positions in departments
    // =========================================================================

    public function storeRole(Request $request): JsonResponse
    {
        $data = $request->validate([
            'nom_role' => 'required|string|max:100|unique:roles,nom_role',
            'label'    => 'required|string|max:50',
            'niveau'   => 'required|integer|min:1|max:5',
        ]);

        $role = Role::create($data);

        $this->audit('CREATE', 'roles', $role->id, null, $role->toArray());

        return response()->json($role, 201);
    }
}
