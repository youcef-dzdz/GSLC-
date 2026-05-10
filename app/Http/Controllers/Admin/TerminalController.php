<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Traits\Auditable;
use App\Models\Terminal;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class TerminalController extends Controller
{
    use Auditable;

    public function index(): JsonResponse
    {
        $terminaux = Terminal::with('port')
            ->orderBy('nom_terminal')
            ->get();

        return response()->json($terminaux);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'port_id'         => 'required|exists:ports,id',
            'code_terminal'   => 'required|string|max:20|unique:terminaux,code_terminal',
            'nom_terminal'    => 'required|string|max:100',
            'capacite_max_teu'=> 'required|integer|min:0',
            'actif'           => 'boolean',
        ]);

        $terminal = Terminal::create($validated);
        $this->audit('CREATE', 'terminaux', $terminal->id, null, $terminal->toArray());

        return response()->json(['message' => 'Terminal créé.', 'terminal' => $terminal->load('port')], 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $terminal = Terminal::findOrFail($id);
        $old      = $terminal->toArray();

        $validated = $request->validate([
            'port_id'         => 'required|exists:ports,id',
            'code_terminal'   => 'required|string|max:20|unique:terminaux,code_terminal,' . $id,
            'nom_terminal'    => 'required|string|max:100',
            'capacite_max_teu'=> 'required|integer|min:0',
            'actif'           => 'boolean',
        ]);

        $terminal->update($validated);
        $this->audit('UPDATE', 'terminaux', $terminal->id, $old, $terminal->fresh()->toArray());

        return response()->json(['message' => 'Terminal mis à jour.', 'terminal' => $terminal->fresh()->load('port')]);
    }

    public function destroy(int $id): JsonResponse
    {
        $terminal = Terminal::findOrFail($id);
        $old = $terminal->toArray();
        $terminal->moveToCorbeille(auth()->id(), request()->ip());
        $this->audit('DELETE', 'terminaux', $terminal->id, $old, null);

        return response()->json(['message' => 'Terminal supprimé.']);
    }
}
