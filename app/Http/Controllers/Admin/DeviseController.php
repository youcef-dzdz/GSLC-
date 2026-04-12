<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Traits\Auditable;
use App\Models\Devise;
use App\Services\DeviseService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DeviseController extends Controller
{
    use Auditable;

    public function __construct(private DeviseService $service) {}

    // GET /admin/currencies — list all active currencies with rates
    public function index(): JsonResponse
    {
        $devises = Devise::where('actif', true)->orderBy('code')->get()->map(fn($d) => [
            'id'                => $d->id,
            'code'              => $d->code,
            'nom'               => $d->nom,
            'symbole'           => $d->symbole,
            'taux_actuel'       => (float) $d->taux_actuel,
            'date_derniere_maj' => $d->date_derniere_maj?->toDateString(),
            'source'            => $d->source,
        ]);

        return response()->json(['devises' => $devises]);
    }

    // POST /admin/currencies/{code}/update — manual rate update
    public function updateRate(Request $request, string $code): JsonResponse
    {
        $request->validate([
            'taux' => 'required|numeric|min:0.0001',
        ]);

        $devise = $this->service->mettreAJour($code, (float) $request->taux);

        $this->audit('UPDATE', 'devises', $devise->id, null, [
            'code' => $devise->code,
            'nouveau_taux' => $devise->taux_actuel,
        ]);

        return response()->json([
            'message' => "Taux {$devise->code} mis à jour manuellement.",
            'devise'  => [
                'code'              => $devise->code,
                'taux_actuel'       => (float) $devise->taux_actuel,
                'date_derniere_maj' => $devise->date_derniere_maj?->toDateString(),
                'source'            => $devise->source,
            ],
        ]);
    }

    // POST /admin/currencies/sync — fetch live rates from external API
    public function sync(): JsonResponse
    {
        $result = $this->service->syncRates();

        if ($result['updated'] > 0) {
            $this->audit('UPDATE', 'devises', null, null, [
                'action'  => 'sync',
                'updated' => $result['updated'],
                'source'  => 'API_FRANKFURTER',
            ]);
        }

        return response()->json($result, $result['updated'] > 0 ? 200 : 422);
    }
}
