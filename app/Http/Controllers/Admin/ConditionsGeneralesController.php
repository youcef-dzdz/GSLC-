<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Traits\Auditable;
use App\Models\ConditionsGenerales;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ConditionsGeneralesController extends Controller
{
    use Auditable;

    public function index(): JsonResponse
    {
        $conditions = ConditionsGenerales::with('creePar:id,nom,prenom')
            ->orderByDesc('created_at')
            ->get();

        return response()->json(['conditions' => $conditions]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'version'          => 'required|string|max:20|unique:conditions_generales,version',
            'titre'            => 'required|string|max:255',
            'contenu'          => 'required|string',
            'date_application' => 'nullable|date',
        ]);

        $validated['cree_par_user_id'] = auth()->id();
        $validated['actif']            = false;

        $condition = ConditionsGenerales::create($validated);
        $condition->load('creePar:id,nom,prenom');

        $this->audit('CREATE', 'conditions_generales', $condition->id, null, [
            'version' => $condition->version,
            'titre'   => $condition->titre,
        ]);

        return response()->json(['condition' => $condition], 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $condition = ConditionsGenerales::findOrFail($id);

        $validated = $request->validate([
            'titre'            => 'sometimes|string|max:255',
            'contenu'          => 'sometimes|string',
            'date_application' => 'nullable|date',
        ]);

        $before = $condition->toArray();
        $condition->update($validated);
        $condition->load('creePar:id,nom,prenom');

        $this->audit('UPDATE', 'conditions_generales', $condition->id, $before, $validated);

        return response()->json(['condition' => $condition->fresh()->load('creePar:id,nom,prenom')]);
    }

    public function activate(int $id): JsonResponse
    {
        $condition = ConditionsGenerales::findOrFail($id);

        if ($condition->actif) {
            return response()->json(['message' => 'Cette version est déjà active.'], 422);
        }

        DB::transaction(function () use ($condition) {
            ConditionsGenerales::where('actif', true)->update(['actif' => false]);
            $condition->update(['actif' => true]);
        });

        $this->audit('UPDATE', 'conditions_generales', $condition->id, ['actif' => false], ['actif' => true]);

        return response()->json([
            'message'   => 'Version ' . $condition->version . ' activée avec succès.',
            'condition' => $condition->fresh()->load('creePar:id,nom,prenom'),
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        $condition = ConditionsGenerales::findOrFail($id);

        if ($condition->contrats()->exists()) {
            return response()->json([
                'message' => 'Ces conditions générales ne peuvent pas être supprimées car elles sont liées à des contrats. Créez une nouvelle version à la place.',
            ], 422);
        }

        if ($condition->actif) {
            return response()->json([
                'message' => 'La version active ne peut pas être supprimée. Activez une autre version d\'abord.',
            ], 422);
        }

        $this->audit('DELETE', 'conditions_generales', $condition->id, $condition->toArray(), null);
        $condition->delete();

        return response()->json(['message' => 'Version supprimée avec succès.']);
    }
}
