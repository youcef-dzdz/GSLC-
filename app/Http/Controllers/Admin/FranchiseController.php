<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Traits\Auditable;
use App\Models\Franchise;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FranchiseController extends Controller
{
    use Auditable;

    public function index(): JsonResponse
    {
        $franchises = Franchise::with([
            'typeConteneur:id,code_type,libelle',
            'port:id,nom_port,code_port',
            'client:id,raison_sociale',
        ])->orderByDesc('created_at')->get();

        return response()->json(['franchises' => $franchises]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'type_conteneur_id'   => 'required|exists:types_conteneur,id',
            'port_id'             => 'nullable|exists:ports,id',
            'client_id'           => 'nullable|exists:clients,id',
            'type_franchise'      => 'required|in:DEMURRAGE,DETENTION',
            'jours_franchise'     => 'required|integer|min:1',
            'description'         => 'nullable|string|max:1000',
            'date_debut_validite' => 'required|date',
            'date_fin_validite'   => 'nullable|date|after_or_equal:date_debut_validite',
            'actif'               => 'boolean',
        ]);

        $franchise = Franchise::create($validated);
        $franchise->load([
            'typeConteneur:id,code_type,libelle',
            'port:id,nom_port,code_port',
            'client:id,raison_sociale',
        ]);

        $this->audit('CREATE', 'franchises', $franchise->id, null, [
            'type_franchise'  => $franchise->type_franchise,
            'jours_franchise' => $franchise->jours_franchise,
        ]);

        return response()->json(['franchise' => $franchise], 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $franchise = Franchise::findOrFail($id);

        $validated = $request->validate([
            'type_conteneur_id'   => 'sometimes|exists:types_conteneur,id',
            'port_id'             => 'nullable|exists:ports,id',
            'client_id'           => 'nullable|exists:clients,id',
            'type_franchise'      => 'sometimes|in:DEMURRAGE,DETENTION',
            'jours_franchise'     => 'sometimes|integer|min:1',
            'description'         => 'nullable|string|max:1000',
            'date_debut_validite' => 'sometimes|date',
            'date_fin_validite'   => 'nullable|date|after_or_equal:date_debut_validite',
            'actif'               => 'boolean',
        ]);

        $before = $franchise->toArray();
        $franchise->update($validated);
        $franchise->load([
            'typeConteneur:id,code_type,libelle',
            'port:id,nom_port,code_port',
            'client:id,raison_sociale',
        ]);

        $this->audit('UPDATE', 'franchises', $franchise->id, $before, $validated);

        return response()->json(['franchise' => $franchise->fresh()->load([
            'typeConteneur:id,code_type,libelle',
            'port:id,nom_port,code_port',
            'client:id,raison_sociale',
        ])]);
    }

    public function destroy(int $id): JsonResponse
    {
        $franchise = Franchise::findOrFail($id);

        if ($franchise->calculPenalites()->exists()) {
            return response()->json([
                'message' => 'Cette franchise ne peut pas être supprimée car elle est liée à des calculs de pénalités. Désactivez-la à la place.',
            ], 422);
        }

        $old = $franchise->toArray();
        $franchise->moveToCorbeille(auth()->id(), request()->ip());
        $this->audit('DELETE', 'franchises', $franchise->id, $old, null);

        return response()->json(['message' => 'Franchise supprimée avec succès.']);
    }
}
