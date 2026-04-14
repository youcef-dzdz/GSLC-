<?php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\Permission;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RoleController extends Controller
{
    // GET /api/admin/roles
    public function index(): JsonResponse
    {
        $roles = Role::with(['permissions' => function ($q) {
            $q->select(
                'permissions.id',
                'permissions.name',
                'permissions.label',
                'permissions.module',
                'permissions.is_system'
            );
        }])
        ->orderBy('niveau')
        ->get(['id', 'nom_role', 'label', 'niveau', 'is_system', 'description']);
        return response()->json($roles);
    }

    // POST /api/admin/roles
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'nom_role'    => 'required|string|max:100|unique:roles,nom_role',
            'label'       => 'required|string|max:50',
            'niveau'      => 'required|integer|min:1|max:5',
            'description' => 'nullable|string|max:255',
        ]);
        $role = Role::create($data);
        return response()->json($role, 201);
    }

    // GET /api/admin/roles/{role}
    public function show(Role $role): JsonResponse
    {
        return response()->json(
            $role->load(['permissions' => function ($q) {
                $q->select(
                    'permissions.id',
                    'permissions.name',
                    'permissions.label',
                    'permissions.module',
                    'permissions.is_system'
                );
            }])
        );
    }

    // PUT /api/admin/roles/{role}
    public function update(Request $request, Role $role): JsonResponse
    {
        if ($role->is_system) {
            return response()->json(['message' => 'Ce rôle système ne peut pas être modifié.'], 403);
        }
        $data = $request->validate([
            'nom_role'    => 'sometimes|string|max:100|unique:roles,nom_role,' . $role->id,
            'label'       => 'sometimes|string|max:50',
            'niveau'      => 'sometimes|integer|min:1|max:5',
            'description' => 'nullable|string|max:255',
        ]);
        $role->update($data);
        return response()->json($role);
    }

    // DELETE /api/admin/roles/{role}
    public function destroy(Role $role): JsonResponse
    {
        if ($role->is_system) {
            return response()->json(['message' => 'Ce rôle système ne peut pas être supprimé.'], 403);
        }
        if ($role->users()->count() > 0) {
            return response()->json(['message' => 'Ce rôle est assigné à des utilisateurs actifs.'], 409);
        }
        $role->delete();
        return response()->json(['message' => 'Rôle supprimé.']);
    }

    // PUT /api/admin/roles/{role}/permissions
    // Body: { "permission_ids": [1, 3, 7] }
    public function syncPermissions(Request $request, Role $role): JsonResponse
    {
        if ($role->is_system) {
            return response()->json(['message' => 'Les permissions de ce rôle système ne peuvent pas être modifiées.'], 403);
        }
        $request->validate([
            'permission_ids'   => 'required|array',
            'permission_ids.*' => 'integer|exists:permissions,id',
        ]);
        $role->permissions()->sync($request->permission_ids);
        return response()->json([
            'message'     => 'Permissions synchronisées.',
            'permissions' => $role->fresh()
                ->load(['permissions' => function ($q) {
                    $q->select(
                        'permissions.id',
                        'permissions.name',
                        'permissions.label',
                        'permissions.module',
                        'permissions.is_system'
                    );
                }])->permissions,
        ]);
    }
}
