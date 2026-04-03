<?php

// =============================================================================
// FILE: app/Http/Controllers/MouvementController.php
// =============================================================================

namespace App\Http\Controllers\Logistique;

use App\Http\Controllers\Controller;

use App\Models\MouvementConteneur;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class MouvementController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = MouvementConteneur::with([
            'conteneur.typeConteneur',
            'responsable',
            'port',
        ])->orderByDesc('date_mouvement');

        if ($request->filled('conteneur_id')) {
            $query->where('conteneur_id', $request->conteneur_id);
        }

        if ($request->filled('type_mouvement')) {
            $query->where('type_mouvement', $request->type_mouvement);
        }

        if ($request->filled('date_debut')) {
            $query->whereDate('date_mouvement', '>=', $request->date_debut);
        }

        if ($request->filled('date_fin')) {
            $query->whereDate('date_mouvement', '<=', $request->date_fin);
        }

        return response()->json($query->paginate(50));
    }
}
