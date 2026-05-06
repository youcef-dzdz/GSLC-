<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Traits\Auditable;
use App\Models\TarifService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TarifServiceController extends Controller
{
    use Auditable;

    public function index(): JsonResponse
    {
        $tarifs = TarifService::with('typeConteneur:id,code_type,libelle')
            ->orderBy('code_tarif')
            ->get();

        return response()->json(['tarifs' => $tarifs]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'code_tarif'        => 'required|string|max:50|unique:tarifs_service,code_tarif',
            'libelle_service'   => 'required|string|max:255',
            'type_conteneur_id' => 'nullable|exists:types_conteneur,id',
            'montant_unitaire'  => 'required|numeric|min:0',
            'unite'             => 'required|string|in:par jour,par conteneur,par tonne,forfait',
            'tva_applicable'    => 'boolean',
            'date_debut'        => 'nullable|date',
            'date_fin'          => 'nullable|date|after_or_equal:date_debut',
            'actif'             => 'boolean',
        ]);

        $tarif = TarifService::create($validated);
        $tarif->load('typeConteneur:id,code_type,libelle');

        $this->audit('CREATE', 'tarifs_service', $tarif->id, null, [
            'code_tarif'      => $tarif->code_tarif,
            'libelle_service' => $tarif->libelle_service,
        ]);

        return response()->json(['tarif' => $tarif], 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $tarif = TarifService::findOrFail($id);

        $validated = $request->validate([
            'code_tarif'        => 'sometimes|string|max:50|unique:tarifs_service,code_tarif,' . $id,
            'libelle_service'   => 'sometimes|string|max:255',
            'type_conteneur_id' => 'nullable|exists:types_conteneur,id',
            'montant_unitaire'  => 'sometimes|numeric|min:0',
            'unite'             => 'sometimes|string|in:par jour,par conteneur,par tonne,forfait',
            'tva_applicable'    => 'boolean',
            'date_debut'        => 'nullable|date',
            'date_fin'          => 'nullable|date|after_or_equal:date_debut',
            'actif'             => 'boolean',
        ]);

        $before = $tarif->toArray();
        $tarif->update($validated);
        $tarif->load('typeConteneur:id,code_type,libelle');

        $this->audit('UPDATE', 'tarifs_service', $tarif->id, $before, $validated);

        return response()->json(['tarif' => $tarif]);
    }

    public function destroy(int $id): JsonResponse
    {
        $tarif = TarifService::findOrFail($id);

        $usedInDevis    = $tarif->lignesDevis()->exists();
        $usedInFactures = $tarif->lignesFacture()->exists();

        if ($usedInDevis || $usedInFactures) {
            return response()->json([
                'message' => 'Ce tarif ne peut pas être supprimé car il est utilisé dans '
                    . ($usedInDevis ? 'des devis' : '')
                    . ($usedInDevis && $usedInFactures ? ' et dans ' : '')
                    . ($usedInFactures ? 'des factures' : '')
                    . '. Désactivez-le à la place.',
            ], 422);
        }

        $this->audit('DELETE', 'tarifs_service', $tarif->id, $tarif->toArray(), null);
        $tarif->delete();

        return response()->json(['message' => 'Tarif supprimé avec succès.']);
    }
}
