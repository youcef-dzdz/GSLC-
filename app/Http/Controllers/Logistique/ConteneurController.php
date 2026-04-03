<?php

namespace App\Http\Controllers\Logistique;

use App\Http\Controllers\Controller;

use App\Http\Controllers\Traits\Auditable;
use App\Models\Conteneur;
use App\Models\MouvementConteneur;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class ConteneurController extends Controller
{
    use Auditable;

    /**
     * Legal state transitions for the 8-state lifecycle.
     * Key = current state, Value = allowed next states.
     *
     * RESERVE → ARRIVE_PORT → EN_TERMINAL → LIVRE_CLIENT
     *                                           ↓
     *                          RETOURNE_VIDE → INSPECTE → DISPONIBLE → HORS_SERVICE
     */
    private array $transitions = [
        'RESERVE'        => ['ARRIVE_PORT'],
        'ARRIVE_PORT'    => ['EN_TERMINAL'],
        'EN_TERMINAL'    => ['LIVRE_CLIENT'],
        'LIVRE_CLIENT'   => ['RETOURNE_VIDE'],
        'RETOURNE_VIDE'  => ['INSPECTE'],
        'INSPECTE'       => ['DISPONIBLE', 'HORS_SERVICE'],
        'DISPONIBLE'     => ['RESERVE', 'HORS_SERVICE'],
        'HORS_SERVICE'   => [],
    ];

    // =========================================================================
    // INDEX
    // =========================================================================

    public function index(Request $request): JsonResponse
    {
        $query = Conteneur::with(['typeConteneur'])
            ->orderByDesc('created_at');

        if ($request->filled('statut')) {
            $query->where('statut', $request->statut);
        }

        if ($request->filled('type_id')) {
            $query->where('type_id', $request->type_id);
        }

        if ($request->filled('search')) {
            $query->where('numero_conteneur', 'ilike', '%' . $request->search . '%');
        }

        $conteneurs = $query->paginate(20);

        $conteneurs->getCollection()->transform(fn($c) => [
            'id'               => $c->id,
            'numero_conteneur' => $c->numero_conteneur,
            'type'             => $c->typeConteneur?->libelle,
            'type_code'        => $c->typeConteneur?->code_type,
            'statut'           => $c->statut,
            'etat_actuel'      => $c->etat_actuel,
            'est_frigo'        => $c->typeConteneur?->est_frigo,
            'temperature'      => $c->temperature,
            'proprietaire'     => $c->proprietaire,
            'created_at'       => $c->created_at,
        ]);

        return response()->json($conteneurs);
    }

    // =========================================================================
    // SHOW
    // =========================================================================

    public function show(int $id): JsonResponse
    {
        $conteneur = Conteneur::with([
            'typeConteneur',
            'mouvements' => fn($q) => $q->orderByDesc('date_mouvement'),
            'mouvements.responsable',
            'mouvements.port',
        ])->findOrFail($id);

        return response()->json([
            'conteneur'          => $conteneur,
            'transitions_legales'=> $this->transitions[$conteneur->statut] ?? [],
        ]);
    }

    // =========================================================================
    // CHANGE STATUS — enforces 8-state lifecycle
    // =========================================================================

    public function changeStatus(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'nouveau_statut' => 'required|string',
            'notes'          => 'nullable|string',
            'port_id'        => 'nullable|exists:ports,id',
            'depot_id'       => 'nullable|exists:depots,id',
        ]);

        $conteneur     = Conteneur::findOrFail($id);
        $currentStatut = $conteneur->statut;
        $newStatut     = $request->nouveau_statut;

        // Validate the transition is legal
        $allowedTransitions = $this->transitions[$currentStatut] ?? [];
        if (! in_array($newStatut, $allowedTransitions)) {
            return response()->json([
                'message'           => "Transition invalide : {$currentStatut} → {$newStatut} n'est pas autorisée.",
                'statut_actuel'     => $currentStatut,
                'transitions_legales' => $allowedTransitions,
            ], 422);
        }

        DB::beginTransaction();
        try {
            $old = $conteneur->toArray();

            $conteneur->update([
                'statut'      => $newStatut,
                'etat_actuel' => $newStatut,
            ]);

            // Create movement record
            MouvementConteneur::create([
                'conteneur_id'   => $conteneur->id,
                'port_id'        => $request->port_id,
                'depot_id'       => $request->depot_id,
                'responsable_id' => Auth::id(),
                'type_mouvement' => $newStatut,
                'date_mouvement' => now(),
                'notes'          => $request->notes ?? "Changement de statut : {$currentStatut} → {$newStatut}",
            ]);

            DB::commit();

            // Audit both tables
            $this->audit('UPDATE', 'conteneurs', $conteneur->id, $old, ['statut' => $newStatut]);
            $this->audit('CREATE', 'mouvement_conteneurs', $conteneur->id, null, [
                'conteneur_id'   => $conteneur->id,
                'type_mouvement' => $newStatut,
            ]);

            return response()->json([
                'message'   => "Statut mis à jour : {$currentStatut} → {$newStatut}",
                'conteneur' => $conteneur->fresh()->load('typeConteneur'),
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Erreur : ' . $e->getMessage()], 500);
        }
    }
}
