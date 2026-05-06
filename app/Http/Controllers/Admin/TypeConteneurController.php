<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Traits\Auditable;
use App\Models\TypeConteneur;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TypeConteneurController extends Controller
{
    use Auditable;

    public function index(): JsonResponse
    {
        $types = TypeConteneur::orderBy('code_type')->get();

        return response()->json(['types' => $types]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'code_type'                => 'required|string|max:10|unique:types_conteneur,code_type',
            'libelle'                  => 'required|string|max:255',
            'longueur_pieds'           => 'required|integer|in:20,40,45',
            'est_frigo'                => 'boolean',
            'poids_tare'               => 'required|numeric|min:0',
            'charge_utile'             => 'nullable|numeric|min:0',
            'volume'                   => 'nullable|numeric|min:0',
            'tarif_journalier_defaut'  => 'required|numeric|min:0',
            'actif'                    => 'boolean',
        ]);

        $type = TypeConteneur::create($validated);

        $this->audit('CREATE', 'types_conteneur', $type->id, null, [
            'code_type' => $type->code_type,
            'libelle'   => $type->libelle,
        ]);

        return response()->json(['type' => $type], 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $type = TypeConteneur::findOrFail($id);

        $validated = $request->validate([
            'code_type'                => 'sometimes|string|max:10|unique:types_conteneur,code_type,' . $id,
            'libelle'                  => 'sometimes|string|max:255',
            'longueur_pieds'           => 'sometimes|integer|in:20,40,45',
            'est_frigo'                => 'boolean',
            'poids_tare'               => 'sometimes|numeric|min:0',
            'charge_utile'             => 'nullable|numeric|min:0',
            'volume'                   => 'nullable|numeric|min:0',
            'tarif_journalier_defaut'  => 'sometimes|numeric|min:0',
            'actif'                    => 'boolean',
        ]);

        $before = $type->toArray();
        $type->update($validated);

        $this->audit('UPDATE', 'types_conteneur', $type->id, $before, $validated);

        return response()->json(['type' => $type->fresh()]);
    }

    public function destroy(int $id): JsonResponse
    {
        $type = TypeConteneur::findOrFail($id);

        $usedByConteneurs = $type->conteneurs()->exists();
        $usedByTarifs     = $type->tarifsService()->exists();
        $usedByPenalites  = $type->penalites()->exists();

        if ($usedByConteneurs || $usedByTarifs || $usedByPenalites) {
            $refs = array_filter([
                $usedByConteneurs ? 'des conteneurs'  : null,
                $usedByTarifs     ? 'des tarifs'      : null,
                $usedByPenalites  ? 'des pénalités'   : null,
            ]);
            return response()->json([
                'message' => 'Ce type de conteneur ne peut pas être supprimé car il est utilisé dans '
                    . implode(' et ', $refs)
                    . '. Désactivez-le à la place.',
            ], 422);
        }

        $this->audit('DELETE', 'types_conteneur', $type->id, $type->toArray(), null);
        $type->delete();

        return response()->json(['message' => 'Type de conteneur supprimé avec succès.']);
    }
}
