<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Traits\Auditable;
use App\Models\Depot;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class DepotController extends Controller
{
    use Auditable;

    public function index(): JsonResponse
    {
        $depots = Depot::with(['port', 'terminal'])
            ->orderBy('code_depot')
            ->get();

        return response()->json($depots);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'port_id'         => 'required|exists:ports,id',
            'terminal_id'     => 'nullable|exists:terminaux,id',
            'code_depot'      => 'required|string|max:20|unique:depots,code_depot',
            'nom_depot'       => 'required|string|max:100',
            'type_stockage'   => 'required|in:SEC,FRIGO,DANGEREUX',
            'capacite_totale' => 'required|integer|min:0',
            'actif'           => 'boolean',
        ]);

        $depot = Depot::create($validated);
        $this->audit('CREATE', 'depots', $depot->id, null, $depot->toArray());

        return response()->json(['message' => 'Dépôt créé.', 'depot' => $depot->load(['port', 'terminal'])], 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $depot = Depot::findOrFail($id);
        $old   = $depot->toArray();

        $validated = $request->validate([
            'port_id'         => 'required|exists:ports,id',
            'terminal_id'     => 'nullable|exists:terminaux,id',
            'code_depot'      => 'required|string|max:20|unique:depots,code_depot,' . $id,
            'nom_depot'       => 'required|string|max:100',
            'type_stockage'   => 'required|in:SEC,FRIGO,DANGEREUX',
            'capacite_totale' => 'required|integer|min:0',
            'actif'           => 'boolean',
        ]);

        $depot->update($validated);
        $this->audit('UPDATE', 'depots', $depot->id, $old, $depot->fresh()->toArray());

        return response()->json(['message' => 'Dépôt mis à jour.', 'depot' => $depot->fresh()->load(['port', 'terminal'])]);
    }

    public function destroy(int $id): JsonResponse
    {
        $depot = Depot::findOrFail($id);
        $this->audit('DELETE', 'depots', $depot->id, $depot->toArray(), null);
        $depot->delete();

        return response()->json(['message' => 'Dépôt supprimé.']);
    }
}
