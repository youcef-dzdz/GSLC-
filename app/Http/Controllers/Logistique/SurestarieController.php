<?php

namespace App\Http\Controllers\Logistique;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Traits\Auditable;
use App\Models\CalculPenalite;
use App\Models\Conteneur;
use App\Models\ContratImport;
use App\Services\SurestarieService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SurestarieController extends Controller
{
    use Auditable;

    public function __construct(private SurestarieService $service) {}

    // =========================================================================
    // PREVIEW — calculate the current surestarie for a container (not saved)
    // GET /logistics/containers/{id}/surestarie
    // GET /finance/containers/{id}/surestarie
    // =========================================================================

    public function show(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'contrat_id' => 'required|exists:contrats_import,id',
            'type'       => 'nullable|in:DEMURRAGE,DETENTION',
            'date'       => 'nullable|date',
        ]);

        $conteneur = Conteneur::with('type')->findOrFail($id);
        $contrat   = ContratImport::findOrFail($request->contrat_id);
        $date      = $request->filled('date') ? Carbon::parse($request->date) : null;
        $type      = $request->get('type', 'DEMURRAGE');

        $calcul = $this->service->calculer($conteneur, $contrat, $date, $type);

        return response()->json($calcul);
    }

    // =========================================================================
    // SAVE — persist a CalculPenalite record
    // POST /logistics/containers/{id}/surestarie/calculer
    // POST /finance/containers/{id}/surestarie/calculer
    // =========================================================================

    public function calculer(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'contrat_id' => 'required|exists:contrats_import,id',
            'type'       => 'nullable|in:DEMURRAGE,DETENTION',
            'date'       => 'nullable|date',
        ]);

        $conteneur = Conteneur::with('type')->findOrFail($id);
        $contrat   = ContratImport::findOrFail($request->contrat_id);
        $date      = $request->filled('date') ? Carbon::parse($request->date) : null;
        $type      = $request->get('type', 'DEMURRAGE');

        $calcul = $this->service->calculer($conteneur, $contrat, $date, $type);

        if ($calcul['erreur']) {
            return response()->json(['message' => $calcul['erreur']], 422);
        }

        if ($calcul['jours_retard'] === 0) {
            return response()->json([
                'message' => 'Pas de surestarie : le conteneur est encore dans sa période de franchise.',
                'calcul'  => $calcul,
            ]);
        }

        $record = $this->service->sauvegarder($calcul);

        $this->audit('CREATE', 'calcul_penalites', $record->id, null, [
            'conteneur_id' => $conteneur->id,
            'contrat_id'   => $contrat->id,
            'montant_ttc'  => $record->montant_ttc,
            'jours_retard' => $record->jours_retard,
        ]);

        return response()->json([
            'message' => 'Surestarie calculée et enregistrée.',
            'record'  => $record,
            'detail'  => $calcul['penalites_detail'],
        ], 201);
    }

    // =========================================================================
    // PREDICT — forecast upcoming surestaries for a container
    // GET /logistics/containers/{id}/surestarie/predict
    // =========================================================================

    public function predict(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'contrat_id' => 'required|exists:contrats_import,id',
            'type'       => 'nullable|in:DEMURRAGE,DETENTION',
        ]);

        $conteneur = Conteneur::with('type')->findOrFail($id);
        $contrat   = ContratImport::findOrFail($request->contrat_id);
        $type      = $request->get('type', 'DEMURRAGE');

        $prediction = $this->service->predire($conteneur, $contrat, $type);

        return response()->json($prediction);
    }

    // =========================================================================
    // SIMULATION — estimate surestarie without a real container
    // GET /logistics/surestarie/simulation
    // GET /finance/surestarie/simulation
    // =========================================================================

    public function simulation(Request $request): JsonResponse
    {
        $request->validate([
            'type_conteneur_id' => 'required|exists:types_conteneur,id',
            'date_arrivee'      => 'required|date',
            'date_reference'    => 'nullable|date|after_or_equal:date_arrivee',
            'port_id'           => 'nullable|exists:ports,id',
            'client_id'         => 'nullable|exists:clients,id',
            'type'              => 'nullable|in:DEMURRAGE,DETENTION',
        ]);

        $dateArrivee   = Carbon::parse($request->date_arrivee);
        $dateReference = $request->filled('date_reference')
            ? Carbon::parse($request->date_reference)
            : now();
        $type = $request->get('type', 'DEMURRAGE');

        $result = $this->service->simuler(
            $request->type_conteneur_id,
            $request->port_id,
            $request->client_id,
            $dateArrivee,
            $dateReference,
            $type
        );

        return response()->json($result);
    }

    // =========================================================================
    // INDEX — list all saved CalculPenalite records (finance view)
    // GET /finance/surestaries
    // =========================================================================

    public function index(Request $request): JsonResponse
    {
        $query = CalculPenalite::with([
            'conteneur',
            'contrat.client',
            'creePar',
        ])->orderByDesc('created_at');

        if ($request->filled('statut')) {
            $query->where('statut', $request->statut);
        }

        if ($request->filled('type_penalite')) {
            $query->where('type_penalite', $request->type_penalite);
        }

        if ($request->filled('contrat_id')) {
            $query->where('contrat_id', $request->contrat_id);
        }

        if ($request->filled('conteneur_id')) {
            $query->where('conteneur_id', $request->conteneur_id);
        }

        $records = $query->paginate(20);

        $records->getCollection()->transform(fn($r) => [
            'id'                       => $r->id,
            'conteneur'                => $r->conteneur?->numero_conteneur,
            'client'                   => $r->contrat?->client?->raison_sociale,
            'type_penalite'            => $r->type_penalite,
            'date_debut'               => $r->date_debut,
            'date_fin'                 => $r->date_fin,
            'jours_franchise_appliques'=> $r->jours_franchise_appliques,
            'jours_retard'             => $r->jours_retard,
            'tarif_applique'           => $r->tarif_applique,
            'montant_ht'               => $r->montant_ht,
            'tva'                      => $r->tva,
            'montant_ttc'              => $r->montant_ttc,
            'statut'                   => $r->statut,
            'cree_par'                 => $r->creePar?->name,
            'created_at'               => $r->created_at,
        ]);

        return response()->json($records);
    }
}
