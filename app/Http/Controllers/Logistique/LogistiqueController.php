<?php

namespace App\Http\Controllers\Logistique;

use App\Http\Controllers\Controller;

use App\Http\Controllers\Traits\Auditable;
use App\Models\Conteneur;
use App\Models\Escale;
use App\Models\Depot;
use App\Models\Alerte;
use App\Models\MouvementConteneur;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class LogistiqueController extends Controller
{
    use Auditable;

    // =========================================================================
    // DASHBOARD
    // =========================================================================

    public function dashboard(): JsonResponse
    {
        // Container counts by statut
        $containersAtPort      = Conteneur::whereIn('statut', ['ARRIVE_PORT', 'EN_TERMINAL'])->count();
        $containersAtClient    = Conteneur::where('statut', 'LIVRE_CLIENT')->count();
        $containersAvailable   = Conteneur::where('statut', 'DISPONIBLE')->count();
        $containersReserved    = Conteneur::where('statut', 'RESERVE')->count();

        // Critical alerts
        $urgentAlertes = Alerte::where('niveau', 'CRITIQUE')
            ->where('est_traitee', false)
            ->orderByDesc('created_at')
            ->limit(10)
            ->get()
            ->map(fn($a) => [
                'id'          => $a->id,
                'type_alerte' => $a->type_alerte,
                'message'     => $a->message,
                'created_at'  => $a->created_at,
            ]);

        // Vessel arrivals today
        $arrivalsToday = Escale::with(['navire', 'port'])
            ->whereNull('date_arrivee_reelle')
            ->whereDate('date_arrivee_prevue', today())
            ->get()
            ->map(fn($e) => [
                'id'                  => $e->id,
                'numero_escale'       => $e->numero_escale,
                'navire'              => $e->navire?->nom_navire,
                'port'                => $e->port?->nom_port,
                'date_arrivee_prevue' => $e->date_arrivee_prevue,
                'nombre_conteneurs'   => $e->nombre_conteneurs_prevus,
            ]);

        return response()->json([
            'containers' => [
                'au_port'     => $containersAtPort,
                'chez_client' => $containersAtClient,
                'disponibles' => $containersAvailable,
                'reserves'    => $containersReserved,
            ],
            'urgent_alertes' => $urgentAlertes,
            'arrivals_today' => $arrivalsToday,
        ]);
    }

    // =========================================================================
    // WAREHOUSE
    // =========================================================================

    public function warehouse(): JsonResponse
    {
        $depots = Depot::with([
            'emplacements.conteneur.typeConteneur',
        ])->where('actif', true)->get();

        return response()->json($depots);
    }

    // =========================================================================
    // VESSEL SCHEDULE
    // =========================================================================

    public function vesselSchedule(): JsonResponse
    {
        $escales = Escale::with(['navire', 'port', 'terminal'])
            ->whereIn('statut_escale', ['PREVUE', 'EN_COURS'])
            ->orderBy('date_arrivee_prevue')
            ->paginate(20);

        return response()->json($escales);
    }

    // =========================================================================
    // REGISTER ARRIVAL
    // =========================================================================

    public function registerArrival(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'date_arrivee_reelle' => 'required|date',
            'quai'                => 'nullable|string|max:50',
            'observations'        => 'nullable|string',
        ]);

        $escale = Escale::with('conteneurs')->findOrFail($id);

        if (! is_null($escale->date_arrivee_reelle)) {
            return response()->json([
                'message' => 'L\'arrivée de cette escale a déjà été enregistrée.',
            ], 422);
        }

        $old = $escale->toArray();

        $escale->update([
            'date_arrivee_reelle' => $request->date_arrivee_reelle,
            'quai'                => $request->quai,
            'statut_escale'       => 'EN_COURS',
            'observations'        => $request->observations,
        ]);

        // Move all reserved containers linked to this escale to ARRIVE_PORT
        $conteneurs = Conteneur::where('statut', 'RESERVE')
            ->whereHas('mouvements', fn($q) => $q->where('port_id', $escale->port_id))
            ->get();

        foreach ($conteneurs as $conteneur) {
            $conteneur->update(['statut' => 'ARRIVE_PORT', 'etat_actuel' => 'ARRIVE_PORT']);

            MouvementConteneur::create([
                'conteneur_id'   => $conteneur->id,
                'port_id'        => $escale->port_id,
                'responsable_id' => Auth::id(),
                'type_mouvement' => 'ARRIVEE_PORT',
                'date_mouvement' => now(),
                'notes'          => 'Arrivée enregistrée — Escale ' . $escale->numero_escale,
            ]);
        }

        $this->audit('UPDATE', 'escales', $escale->id, $old, $escale->fresh()->toArray());

        return response()->json([
            'message'            => 'Arrivée enregistrée. ' . $conteneurs->count() . ' conteneur(s) mis à jour.',
            'escale'             => $escale->fresh(),
            'conteneurs_updates' => $conteneurs->count(),
        ]);
    }
}
