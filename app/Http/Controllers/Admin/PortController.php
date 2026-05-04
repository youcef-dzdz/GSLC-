<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Traits\Auditable;
use App\Models\Port;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class PortController extends Controller
{
    use Auditable;

    public function index(): JsonResponse
    {
        $ports = Port::withCount(['terminaux', 'depots'])
            ->orderBy('nom_port')
            ->get();

        return response()->json($ports);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'nom_port'               => 'required|string|max:100',
            'code_port'              => 'required|string|max:10|unique:ports,code_port',
            'ville'                  => 'required|string|max:100',
            'type_port'              => 'required|in:MARITIME,AERIEN,TERRESTRE',
            'jours_allowance_defaut' => 'required|integer|min:0',
            'actif'                  => 'boolean',
        ]);

        $port = Port::create($validated);
        $this->audit('CREATE', 'ports', $port->id, null, $port->toArray());

        return response()->json(['message' => 'Port créé.', 'port' => $port], 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $port = Port::findOrFail($id);
        $old  = $port->toArray();

        $validated = $request->validate([
            'nom_port'               => 'required|string|max:100',
            'code_port'              => 'required|string|max:10|unique:ports,code_port,' . $id,
            'ville'                  => 'required|string|max:100',
            'type_port'              => 'required|in:MARITIME,AERIEN,TERRESTRE',
            'jours_allowance_defaut' => 'required|integer|min:0',
            'actif'                  => 'boolean',
        ]);

        $port->update($validated);
        $this->audit('UPDATE', 'ports', $port->id, $old, $port->fresh()->toArray());

        return response()->json(['message' => 'Port mis à jour.', 'port' => $port->fresh()]);
    }

    public function destroy(int $id): JsonResponse
    {
        $port = Port::findOrFail($id);
        $this->audit('DELETE', 'ports', $port->id, $port->toArray(), null);
        $port->delete();

        return response()->json(['message' => 'Port supprimé.']);
    }
}
