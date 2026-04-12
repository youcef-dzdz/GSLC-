<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Traits\Auditable;
use App\Models\Department;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DepartmentController extends Controller
{
    use Auditable;

    // =========================================================================
    // LIST — GET /api/admin/departments
    // =========================================================================

    public function index(): JsonResponse
    {
        $departments = Department::with('responsable:id,nom,prenom,email')
            ->withCount('users')
            ->orderBy('name')
            ->get()
            ->map(fn($d) => [
                'id'             => $d->id,
                'name'           => $d->name,
                'code'           => $d->code,
                'description'    => $d->description,
                'responsable_id' => $d->responsable_id,
                'responsable'    => $d->responsable ? [
                    'id'     => $d->responsable->id,
                    'nom'    => $d->responsable->nom,
                    'prenom' => $d->responsable->prenom,
                    'email'  => $d->responsable->email,
                ] : null,
                'membres_count'  => $d->users_count,
                'created_at'     => $d->created_at,
            ]);

        return response()->json(['departments' => $departments]);
    }

    // =========================================================================
    // CREATE — POST /api/admin/departments
    // =========================================================================

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'           => 'required|string|max:100|unique:departments,name',
            'code'           => 'required|string|max:20|unique:departments,code|regex:/^[A-Z0-9_]+$/i',
            'description'    => 'nullable|string|max:500',
            'responsable_id' => 'nullable|exists:users,id',
        ]);

        $dept = Department::create($data);
        $dept->load('responsable:id,nom,prenom,email');

        $this->audit('CREATE', 'departments', $dept->id, null, $dept->toArray());

        return response()->json([
            'department' => $dept,
            'message'    => 'Département créé avec succès.',
        ], 201);
    }

    // =========================================================================
    // UPDATE — PUT /api/admin/departments/{id}
    // =========================================================================

    public function update(Request $request, int $id): JsonResponse
    {
        $dept = Department::findOrFail($id);
        $old  = $dept->toArray();

        $data = $request->validate([
            'name'           => 'required|string|max:100|unique:departments,name,' . $id,
            'code'           => 'required|string|max:20|unique:departments,code,' . $id . '|regex:/^[A-Z0-9_]+$/i',
            'description'    => 'nullable|string|max:500',
            'responsable_id' => 'nullable|exists:users,id',
        ]);

        $dept->update($data);
        $dept->load('responsable:id,nom,prenom,email');

        $this->audit('UPDATE', 'departments', $dept->id, $old, $dept->fresh()->toArray());

        return response()->json([
            'department' => $dept,
            'message'    => 'Département mis à jour.',
        ]);
    }

    // =========================================================================
    // DELETE — DELETE /api/admin/departments/{id}
    // =========================================================================

    public function destroy(int $id): JsonResponse
    {
        $dept = Department::withCount('users')->findOrFail($id);

        if ($dept->users_count > 0) {
            return response()->json([
                'message' => "Impossible de supprimer ce département : {$dept->users_count} utilisateur(s) y sont rattachés.",
            ], 422);
        }

        $old = $dept->toArray();
        $dept->delete();

        $this->audit('DELETE', 'departments', $id, $old, null);

        return response()->json(['message' => 'Département supprimé.']);
    }
}
