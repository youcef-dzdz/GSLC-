<?php

namespace App\Http\Controllers\Commercial;

use App\Http\Controllers\Controller;

use App\Http\Controllers\Traits\Auditable;
use App\Models\DemandeImport;
use App\Models\Devis;
use App\Models\ContratImport;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class CommercialController extends Controller
{
    use Auditable;

    // =========================================================================
    // DASHBOARD
    // =========================================================================

    public function dashboard(): JsonResponse
    {
        // Demand pipeline — count by statut
        $pipeline = DemandeImport::select('statut', DB::raw('count(*) as total'))
            ->groupBy('statut')
            ->pluck('total', 'statut');

        // Quote conversion rate this month
        $quotesThisMonth  = Devis::whereMonth('created_at', now()->month)->count();
        $quotesAccepted   = Devis::whereMonth('created_at', now()->month)
                                ->where('statut', 'ACCEPTE')->count();
        $conversionRate   = $quotesThisMonth > 0
            ? round(($quotesAccepted / $quotesThisMonth) * 100, 1)
            : 0;

        // Contracts signed this month
        $contratsThisMonth = ContratImport::whereMonth('created_at', now()->month)
            ->whereNotNull('date_signature')
            ->count();

        // Recent activity — last 10 demands
        $recentDemands = DemandeImport::with(['client'])
            ->orderByDesc('created_at')
            ->limit(10)
            ->get()
            ->map(fn($d) => [
                'id'             => $d->id,
                'numero_dossier' => $d->numero_dossier,
                'client'         => $d->client?->raison_sociale,
                'statut'         => $d->statut,
                'priorite'       => $d->priorite,
                'created_at'     => $d->created_at,
            ]);

        return response()->json([
            'pipeline'          => [
                'EN_ETUDE'              => (int) ($pipeline['EN_ETUDE']              ?? 0),
                'DEVIS_ENVOYE'          => (int) ($pipeline['DEVIS_ENVOYE']          ?? 0),
                'EN_NEGOCIATION'        => (int) ($pipeline['EN_NEGOCIATION']        ?? 0),
                'ACCEPTE'               => (int) ($pipeline['ACCEPTE']              ?? 0),
                'REFUSE'                => (int) ($pipeline['REFUSE']               ?? 0),
            ],
            'quote_conversion'  => [
                'total'    => $quotesThisMonth,
                'acceptes' => $quotesAccepted,
                'taux'     => $conversionRate,
            ],
            'contrats_ce_mois'  => $contratsThisMonth,
            'recent_activity'   => $recentDemands,
        ]);
    }
}
