<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Traits\Auditable;
use App\Models\Position;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PositionController extends Controller
{
    use Auditable;

    // =========================================================================
    // LIST — GET /api/admin/positions
    // Returns all positions, optionally filtered by department_id
    // =========================================================================

    public function index(Request $request): JsonResponse
    {
        $query = Position::with('department:id,name,code')->orderBy('title');

        if ($request->filled('department_id')) {
            $query->where('department_id', $request->department_id);
        }

        $positions = $query->get()->map(fn($p) => [
            'id'            => $p->id,
            'title'         => $p->title,
            'description'   => $p->description,
            'department_id' => $p->department_id,
            'department'    => $p->department ? [
                'id'   => $p->department->id,
                'name' => $p->department->name,
                'code' => $p->department->code,
            ] : null,
        ]);

        return response()->json(['positions' => $positions]);
    }

    // =========================================================================
    // CREATE — POST /api/admin/positions
    // =========================================================================

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'title'         => 'required|string|max:150|unique:positions,title',
            'description'   => 'nullable|string|max:500',
            'department_id' => 'nullable|exists:departments,id',
        ]);

        $position = Position::create($data);
        $position->load('department:id,name,code');

        $this->audit('CREATE', 'positions', $position->id, null, $position->toArray());

        return response()->json([
            'position' => $position,
            'message'  => 'Poste créé avec succès.',
        ], 201);
    }

    // =========================================================================
    // UPDATE — PUT /api/admin/positions/{id}
    // =========================================================================

    public function update(Request $request, int $id): JsonResponse
    {
        $position = Position::findOrFail($id);
        $old      = $position->toArray();

        $data = $request->validate([
            'title'         => 'required|string|max:150|unique:positions,title,' . $id,
            'description'   => 'nullable|string|max:500',
            'department_id' => 'nullable|exists:departments,id',
        ]);

        $position->update($data);
        $position->load('department:id,name,code');

        $this->audit('UPDATE', 'positions', $position->id, $old, $position->fresh()->toArray());

        return response()->json([
            'position' => $position,
            'message'  => 'Poste mis à jour.',
        ]);
    }

    // =========================================================================
    // DELETE — DELETE /api/admin/positions/{id}
    // =========================================================================

    public function destroy(int $id): JsonResponse
    {
        $position = Position::withCount('users')->findOrFail($id);

        if ($position->users_count > 0) {
            return response()->json([
                'message' => "Impossible de supprimer ce poste : {$position->users_count} utilisateur(s) y sont rattachés.",
            ], 422);
        }

        $old = $position->toArray();
        $position->delete();

        $this->audit('DELETE', 'positions', $id, $old, null);

        return response()->json(['message' => 'Poste supprimé.']);
    }
}
