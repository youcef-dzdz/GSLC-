<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Traits\Auditable;
use App\Models\User;
use App\Models\Role;
use App\Models\Client;
use App\Models\Position;
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
        $query = User::with(['role', 'department', 'positionRelation'])->orderByDesc('created_at');

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
            'position'            => $u->positionRelation?->title ?? $u->getOriginal('position'),
            'position_id'         => $u->position_id,
            'position_obj'        => $u->positionRelation ? [
                'id'            => $u->positionRelation->id,
                'title'         => $u->positionRelation->title,
                'department_id' => $u->positionRelation->department_id,
            ] : null,
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

        // Resolve position: find-or-create a Position record and keep the legacy column in sync
        $positionId  = null;
        $positionStr = $request->filled('position') ? trim($request->position) : null;
        if ($positionStr) {
            $pos        = Position::firstOrCreate(['title' => $positionStr], ['department_id' => $request->department_id]);
            $positionId = $pos->id;
        }

        $user = User::create([
            'nom'                 => $request->nom,
            'prenom'              => $request->prenom,
            'email'               => $request->email,
            'password'            => bcrypt($request->password),
            'role_id'             => $request->role_id,
            'department_id'       => $request->department_id,
            'position'            => $positionStr,   // keep legacy column synced
            'position_id'         => $positionId,
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

        $fillable = $request->only(['nom', 'prenom', 'email', 'role_id', 'department_id', 'statut']);

        // Resolve position: find-or-create a Position record and keep the legacy column in sync
        if ($request->has('position')) {
            $positionStr = $request->filled('position') ? trim($request->position) : null;
            if ($positionStr) {
                $deptId      = $request->department_id ?? $user->department_id;
                $pos         = Position::firstOrCreate(['title' => $positionStr], ['department_id' => $deptId]);
                $fillable['position']    = $positionStr;
                $fillable['position_id'] = $pos->id;
            } else {
                $fillable['position']    = null;
                $fillable['position_id'] = null;
            }
        }

        $user->fill($fillable);
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

    public function destroy($id): JsonResponse
    {
        // We use findOrFail to get the active user. 
        // We use forceDelete to permanently remove records and free up the email.
        $user = User::findOrFail($id);

        try {
            $userData = $user->toArray();

            // Delete associated client record first (frees the email)
            if ($user->client) {
                $user->client->forceDelete();
            }

            $user->forceDelete();

            $this->audit('DELETE', 'users', $id, $userData, null);

            return response()->json(['message' => 'Utilisateur et client associé supprimés définitivement.']);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Impossible de supprimer: ' . $e->getMessage()
            ], 422);
        }
    }

    // =========================================================================
    // BLOCK / UNBLOCK — POST /api/admin/users/{id}/block
    // Toggles between SUSPENDU and ACTIF
    // =========================================================================

    public function block($id): JsonResponse
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

        $user->password             = Hash::make($newPassword);
        $user->must_change_password = true;
        $user->save();

        $lang = $request->input('lang',
            $user->preferred_lang
            ?? app()->getLocale()
            ?? 'fr'
        );

        // Email 1 — nouveau mot de passe envoyé au staff
        try {
            \Illuminate\Support\Facades\Mail::to($user->email)
                ->queue(new \App\Mail\StaffNewPassword($user, $newPassword, $lang));
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error(
                'StaffNewPassword email failed: ' . $e->getMessage()
            );
        }

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
