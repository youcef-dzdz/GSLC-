<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Traits\Auditable;
use App\Models\Banque;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BanqueController extends Controller
{
    use Auditable;

    public function index(): JsonResponse
    {
        $banques = Banque::orderBy('code_banque')->get();

        return response()->json(['banques' => $banques]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'nom'          => 'required|string|max:255|unique:banques,nom',
            'code_banque'  => 'required|string|max:20|unique:banques,code_banque',
            'swift'        => 'nullable|string|max:11',
            'telephone'    => 'nullable|string|max:30',
            'adresse'      => 'nullable|string|max:500',
            'actif'        => 'boolean',
        ]);

        $banque = Banque::create($validated);

        $this->audit('CREATE', 'banques', $banque->id, null, [
            'code_banque' => $banque->code_banque,
            'nom'         => $banque->nom,
        ]);

        return response()->json(['banque' => $banque], 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $banque = Banque::findOrFail($id);

        $validated = $request->validate([
            'nom'         => 'sometimes|string|max:255|unique:banques,nom,' . $id,
            'code_banque' => 'sometimes|string|max:20|unique:banques,code_banque,' . $id,
            'swift'       => 'nullable|string|max:11',
            'telephone'   => 'nullable|string|max:30',
            'adresse'     => 'nullable|string|max:500',
            'actif'       => 'boolean',
        ]);

        $before = $banque->toArray();
        $banque->update($validated);

        $this->audit('UPDATE', 'banques', $banque->id, $before, $validated);

        return response()->json(['banque' => $banque->fresh()]);
    }

    public function destroy(int $id): JsonResponse
    {
        $banque = Banque::findOrFail($id);

        $usedByContrats   = $banque->contrats()->exists();
        $usedByPaiements  = $banque->paiements()->exists();

        if ($usedByContrats || $usedByPaiements) {
            $refs = array_filter([
                $usedByContrats  ? 'des contrats'  : null,
                $usedByPaiements ? 'des paiements' : null,
            ]);
            return response()->json([
                'message' => 'Cette banque ne peut pas être supprimée car elle est référencée dans '
                    . implode(' et ', $refs)
                    . '. Désactivez-la à la place.',
            ], 422);
        }

        $old = $banque->toArray();
        $banque->moveToCorbeille(auth()->id(), request()->ip());
        $this->audit('DELETE', 'banques', $banque->id, $old, null);

        return response()->json(['message' => 'Banque supprimée avec succès.']);
    }
}
