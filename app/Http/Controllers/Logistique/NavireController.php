<?php

namespace App\Http\Controllers\Logistique;

use App\Http\Controllers\Controller;

use App\Http\Controllers\Traits\Auditable;
use App\Models\Navire;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class NavireController extends Controller
{
    use Auditable;

    // =========================================================================
    // INDEX
    // =========================================================================

    public function index(Request $request): JsonResponse
    {
        $query = Navire::with('pays')->orderBy('nom_navire');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(fn($q) => $q
                ->where('nom_navire', 'ilike', "%{$search}%")
                ->orWhere('numero_imo', 'ilike', "%{$search}%")
                ->orWhere('compagnie_maritime', 'ilike', "%{$search}%")
            );
        }

        if ($request->filled('actif')) {
            $query->where('actif', $request->boolean('actif'));
        }

        $navires = $query->paginate(20);

        return response()->json($navires);
    }

    // =========================================================================
    // SHOW
    // =========================================================================

    public function show(int $id): JsonResponse
    {
        $navire = Navire::with(['pays', 'escales' => fn($q) => $q->orderByDesc('date_arrivee_prevue')->limit(5)])
            ->findOrFail($id);

        return response()->json($navire);
    }

    // =========================================================================
    // STORE
    // =========================================================================

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'nom_navire'         => 'required|string|max:150',
            'numero_imo'         => 'required|string|max:20|unique:navires,numero_imo',
            'pays_id'            => 'required|exists:pays,id',
            'compagnie_maritime' => 'required|string|max:150',
            'capacite_teu'       => 'required|integer|min:1',
            'annee_construction' => 'nullable|integer|min:1900|max:' . now()->year,
        ]);

        $navire = Navire::create([
            'nom_navire'         => $request->nom_navire,
            'numero_imo'         => $request->numero_imo,
            'pays_id'            => $request->pays_id,
            'compagnie_maritime' => $request->compagnie_maritime,
            'capacite_teu'       => $request->capacite_teu,
            'annee_construction' => $request->annee_construction,
            'actif'              => true,
        ]);

        $this->audit('CREATE', 'navires', $navire->id, null, $navire->toArray());

        return response()->json([
            'message' => 'Navire créé avec succès.',
            'navire'  => $navire->load('pays'),
        ], 201);
    }
}
