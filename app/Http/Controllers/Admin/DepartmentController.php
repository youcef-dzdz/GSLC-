<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Role;
use Illuminate\Http\Request;

class DepartmentController extends Controller
{
    // System roles that cannot be renamed or deleted
    private const PROTECTED_LABELS = ['admin', 'client'];

    public function index()
    {
        return response()->json(
            Role::orderBy('niveau')->orderBy('nom_role')->get(['id', 'nom_role', 'label', 'niveau'])
        );
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'nom_role' => 'required|string|max:100|unique:roles,nom_role',
            'label'    => 'required|string|max:50|unique:roles,label|regex:/^[a-z_]+$/',
            'niveau'   => 'required|integer|min:1|max:10',
        ]);

        $role = Role::create($data);

        return response()->json($role, 201);
    }

    public function update(Request $request, int $id)
    {
        $role = Role::findOrFail($id);

        if (in_array($role->label, self::PROTECTED_LABELS)) {
            return response()->json(['message' => 'Ce rôle système ne peut pas être modifié.'], 403);
        }

        $data = $request->validate([
            'nom_role' => 'required|string|max:100|unique:roles,nom_role,' . $id,
        ]);

        $role->update(['nom_role' => $data['nom_role']]);

        return response()->json($role);
    }

    public function destroy(int $id)
    {
        $role = Role::findOrFail($id);

        if (in_array($role->label, self::PROTECTED_LABELS)) {
            return response()->json(['message' => 'Ce rôle système ne peut pas être supprimé.'], 403);
        }

        if ($role->users()->count() > 0) {
            return response()->json(['message' => 'Impossible de supprimer un département qui a des utilisateurs actifs.'], 422);
        }

        $role->delete();

        return response()->json(['message' => 'Département supprimé.']);
    }
}
