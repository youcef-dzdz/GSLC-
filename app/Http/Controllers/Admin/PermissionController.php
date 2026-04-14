<?php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Permission;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Http\Controllers\Traits\Auditable;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class PermissionController extends Controller
{
    use Auditable;
    // GET /api/admin/permissions
    public function index(Request $request): JsonResponse
    {
        $query = Permission::query();
        if ($request->filled('module')) {
            $query->where('module', $request->module);
        }
        $permissions = $query->orderBy('module')->orderBy('name')->get();
        return response()->json($permissions);
    }

    // GET /api/admin/permissions/grouped
    // Retourne les permissions groupées par module
    public function grouped(): JsonResponse
    {
        $grouped = Permission::orderBy('name')
                             ->get()
                             ->groupBy('module');
        return response()->json($grouped);
    }

    // GET /api/admin/permissions/{permission}
    public function show(Permission $permission): JsonResponse
    {
        return response()->json($permission->load('roles:id,nom_role,label'));
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'        => 'required|string|max:100|unique:permissions,name',
            'label'       => 'required|string|max:150',
            'module'      => 'required|string|max:50',
            'description' => 'nullable|string|max:500',
        ]);
        $data['is_system'] = false;
        $permission = Permission::create($data);
        $this->audit('CREATE', 'permissions',
            $permission->id, null, $permission->toArray());
        return response()->json($permission, 201);
    }

    public function update(
        Request $request, Permission $permission
    ): JsonResponse {
        if ($permission->is_system) {
            return response()->json([
                'message' => 'Cette permission système ne peut pas être modifiée.',
            ], 422);
        }
        $data = $request->validate([
            'label'       => 'sometimes|string|max:150',
            'module'      => 'sometimes|string|max:50',
            'description' => 'nullable|string|max:500',
        ]);
        $old = $permission->toArray();
        $permission->update($data);
        $this->audit('UPDATE', 'permissions',
            $permission->id, $old, $permission->fresh()->toArray());
        return response()->json($permission->fresh());
    }

    public function destroy(Permission $permission): JsonResponse
    {
        if ($permission->is_system) {
            return response()->json([
                'message' => 'Cette permission système ne peut pas être supprimée.',
            ], 422);
        }
        $old = $permission->toArray();
        $permission->delete();
        $this->audit('DELETE', 'permissions',
            $permission->id, $old, null);
        return response()->json(['message' => 'Permission supprimée.']);
    }

    public function userPermissions(int $userId): JsonResponse
    {
        $user = User::with(['role.permissions'])->findOrFail($userId);

        $rolePermissions = $user->role?->permissions
            ->pluck('name')->toArray() ?? [];

        $overrides = DB::table('user_permissions')
            ->join('permissions', 'permissions.id', '=',
                   'user_permissions.permission_id')
            ->where('user_permissions.user_id', $userId)
            ->select('permissions.id',
                     'permissions.name',
                     'permissions.label',
                     'user_permissions.granted')
            ->get();

        $effective = collect($rolePermissions);
        foreach ($overrides as $o) {
            if ($o->granted) {
                $effective->push($o->name);
            } else {
                $effective = $effective->filter(
                    fn($p) => $p !== $o->name
                );
            }
        }

        return response()->json([
            'role_permissions'      => $rolePermissions,
            'overrides'             => $overrides,
            'effective_permissions' => $effective->unique()->values(),
        ]);
    }

    public function setUserPermission(
        Request $request, int $userId
    ): JsonResponse {
        User::findOrFail($userId);
        $request->validate([
            'permission_id' => 'required|exists:permissions,id',
            'granted'       => 'required|boolean',
        ]);
        DB::table('user_permissions')->updateOrInsert(
            ['user_id'       => $userId,
             'permission_id' => $request->permission_id],
            ['granted'       => $request->granted,
             'updated_at'    => now(),
             'created_at'    => now()]
        );
        $this->audit(
            $request->granted ? 'CREATE' : 'UPDATE',
            'user_permissions', $userId, null,
            ['permission_id' => $request->permission_id,
             'granted'       => $request->granted]
        );
        return response()->json([
            'message' => $request->granted
                ? 'Permission accordée.'
                : 'Permission révoquée.',
        ]);
    }

    public function removeUserPermission(
        int $userId, int $permissionId
    ): JsonResponse {
        DB::table('user_permissions')
            ->where('user_id', $userId)
            ->where('permission_id', $permissionId)
            ->delete();
        return response()->json([
            'message' => 'Override supprimé.',
        ]);
    }
}
