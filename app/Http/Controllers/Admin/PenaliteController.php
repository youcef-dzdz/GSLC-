<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Traits\Auditable;
use App\Models\Penalite;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\DB;

class PenaliteController extends Controller
{
    use Auditable;

    // =========================================================================
    // INDEX
    // =========================================================================

    public function index(Request $request): JsonResponse
    {
        $query = Penalite::with(['typeConteneur', 'devise'])
            ->orderBy('type')
            ->orderBy('tranche_debut');

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        if ($request->filled('statut')) {
            $query->where('actif', $request->statut === 'actif');
        }

        if ($request->filled('type_conteneur_id')) {
            $query->where('type_conteneur_id', $request->type_conteneur_id);
        }

        $penalites = $query->get()->map(fn($p) => [
            'id'                  => $p->id,
            'type_conteneur_id'   => $p->type_conteneur_id,
            'type_conteneur'      => $p->typeConteneur?->libelle . ' (' . $p->typeConteneur?->code_type . ')',
            'devise_id'           => $p->devise_id,
            'devise'              => $p->devise?->code,
            'type'                => $p->type,
            'tarif_journalier'    => (float) $p->tarif_journalier,
            'tranche_debut'       => $p->tranche_debut,
            'tranche_fin'         => $p->tranche_fin,
            'date_debut_validite' => $p->date_debut_validite,
            'date_fin_validite'   => $p->date_fin_validite,
            'actif'               => $p->actif,
            'created_at'          => $p->created_at,
        ]);

        return response()->json(['penalites' => $penalites]);
    }

    // =========================================================================
    // STORE
    // =========================================================================

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'type'                => ['required', Rule::in(['DEMURRAGE', 'DETENTION'])],
            'type_conteneur_id'   => 'required|exists:types_conteneur,id',
            'devise_id'           => 'required|exists:devises,id',
            'tarif_journalier'    => 'required|numeric|min:0',
            'tranche_debut'       => 'required|integer|min:1',
            'tranche_fin'         => 'nullable|integer|gt:tranche_debut',
            'date_debut_validite' => 'required|date',
            'date_fin_validite'   => 'nullable|date|after:date_debut_validite',
            'actif'               => 'boolean',
        ]);

        DB::beginTransaction();
        try {
            $penalite = Penalite::create($request->all());

            DB::commit();
            $this->audit('CREATE', 'penalites', $penalite->id, null, $penalite->toArray());

            return response()->json([
                'message' => 'Pénalité créée avec succès.',
                'penalite' => $penalite,
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Erreur lors de la création de la pénalité: ' . $e->getMessage()], 500);
        }
    }

    // =========================================================================
    // UPDATE
    // =========================================================================

    public function update(Request $request, int $id): JsonResponse
    {
        $penalite = Penalite::findOrFail($id);
        $old = $penalite->toArray();

        $request->validate([
            'type'                => ['sometimes', 'required', Rule::in(['DEMURRAGE', 'DETENTION'])],
            'type_conteneur_id'   => 'sometimes|required|exists:types_conteneur,id',
            'devise_id'           => 'sometimes|required|exists:devises,id',
            'tarif_journalier'    => 'sometimes|required|numeric|min:0',
            'tranche_debut'       => 'sometimes|required|integer|min:1',
            'tranche_fin'         => 'sometimes|nullable|integer|gt:tranche_debut',
            'date_debut_validite' => 'sometimes|required|date',
            'date_fin_validite'   => 'sometimes|nullable|date|after:date_debut_validite',
            'actif'               => 'sometimes|boolean',
        ]);

        DB::beginTransaction();
        try {
            $penalite->update($request->all());

            DB::commit();
            $this->audit('UPDATE', 'penalites', $penalite->id, $old, $penalite->fresh()->toArray());

            return response()->json([
                'message' => 'Pénalité mise à jour avec succès.',
                'penalite' => $penalite->fresh(),
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Erreur lors de la mise à jour de la pénalité: ' . $e->getMessage()], 500);
        }
    }

    // =========================================================================
    // DESTROY
    // =========================================================================

    public function destroy(int $id): JsonResponse
    {
        $penalite = Penalite::findOrFail($id);
        $old = $penalite->toArray();

        DB::beginTransaction();
        try {
            $penalite->moveToCorbeille(auth()->id(), request()->ip());

            DB::commit();
            $this->audit('DELETE', 'penalites', $id, $old, null);

            return response()->json(['message' => 'Pénalité supprimée avec succès.']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Erreur lors de la suppression de la pénalité: ' . $e->getMessage()], 500);
        }
    }
}
