<?php

namespace App\Services;

use App\Models\Devise;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class DeviseService
{
    // Rates are cached for 6 hours — precise enough for a logistics app
    private const CACHE_TTL = 21600;

    // Free API, no key required, supports DZD natively
    private const RATES_API = 'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/eur.json';

    // =========================================================================
    // CONVERT — convert an amount between any two currencies
    // All conversions go through DZD as the base.
    // =========================================================================

    public function convertir(float $montant, string $codeSource, string $codeCible = 'DZD'): float
    {
        if (strtoupper($codeSource) === strtoupper($codeCible)) {
            return round($montant, 2);
        }

        $devises = $this->getDevises();

        $source = $devises->firstWhere('code', strtoupper($codeSource));
        $cible  = $devises->firstWhere('code', strtoupper($codeCible));

        if (! $source || ! $cible) {
            throw new \InvalidArgumentException("Devise inconnue : {$codeSource} ou {$codeCible}");
        }

        // source → DZD → target
        $montantDzd = $montant * (float) $source->taux_actuel;

        if (strtoupper($codeCible) === 'DZD') {
            return round($montantDzd, 2);
        }

        return round($montantDzd / (float) $cible->taux_actuel, 2);
    }

    // =========================================================================
    // LIST — all active currencies with their current rates
    // =========================================================================

    public function getTauxActuels(): array
    {
        return $this->getDevises()->map(fn($d) => [
            'code'              => $d->code,
            'nom'               => $d->nom,
            'symbole'           => $d->symbole,
            'taux_actuel'       => (float) $d->taux_actuel,
            'date_derniere_maj' => $d->date_derniere_maj?->toDateString(),
            'source'            => $d->source,
        ])->values()->toArray();
    }

    // =========================================================================
    // SYNC — fetch live rates from frankfurter.app and update the DB
    // Called by the scheduled command (daily) or manually from admin.
    // =========================================================================

    public function syncRates(): array
    {
        try {
            // Get all our active foreign currencies (skip DZD — it's the base)
            $devises = Devise::where('actif', true)
                ->where('code', '!=', 'DZD')
                ->get();

            if ($devises->isEmpty()) {
                return ['updated' => 0, 'message' => 'Aucune devise à mettre à jour.'];
            }

            $symbols = $devises->pluck('code')->implode(',');

            // Ask: 1 DZD = ? [EUR, USD, GBP, CNY]
            // Frankfurter doesn't support DZD as base, so we ask 1 EUR = ? DZD
            // then invert to get 1 DZD = ? EUR
            $response = Http::timeout(10)->get(self::RATES_API);

            if (! $response->successful()) {
                Log::warning('DeviseService: API request failed', ['status' => $response->status()]);
                return ['updated' => 0, 'message' => 'Erreur API externe.'];
            }

            // Response: { "date": "...", "eur": { "dzd": 154.47, "usd": 1.16, ... } }
            $rates = $response->json('eur') ?? [];

            $eurToDzd = (float) ($rates['dzd'] ?? 0);

            if ($eurToDzd <= 0) {
                return ['updated' => 0, 'message' => 'Taux EUR/DZD introuvable dans la réponse API.'];
            }

            $updated = 0;
            foreach ($devises as $devise) {
                $code = strtolower($devise->code);

                if ($devise->code === 'EUR') {
                    $tauxEnDzd = $eurToDzd;
                } elseif (isset($rates[$code]) && (float) $rates[$code] > 0) {
                    // 1 EUR = rates[$code] units of this currency
                    // 1 unit of this currency = eurToDzd / rates[$code] DZD
                    $tauxEnDzd = $eurToDzd / (float) $rates[$code];
                } else {
                    continue;
                }

                $devise->update([
                    'taux_actuel'       => round($tauxEnDzd, 4),
                    'date_derniere_maj' => now(),
                    'source'            => 'API_FRANKFURTER',
                ]);
                $updated++;
            }

            Cache::forget('devises_actives');

            return [
                'updated'   => $updated,
                'message'   => "{$updated} taux mis à jour depuis frankfurter.app.",
                'eur_to_dzd'=> $eurToDzd,
            ];

        } catch (\Exception $e) {
            Log::error('DeviseService syncRates failed: ' . $e->getMessage());
            return ['updated' => 0, 'message' => 'Erreur : ' . $e->getMessage()];
        }
    }

    // =========================================================================
    // MANUAL UPDATE — finance/admin can override a rate manually
    // =========================================================================

    public function mettreAJour(string $code, float $nouveauTaux): Devise
    {
        $devise = Devise::where('code', strtoupper($code))->firstOrFail();

        $devise->update([
            'taux_actuel'       => $nouveauTaux,
            'date_derniere_maj' => now(),
            'source'            => 'MANUEL',
        ]);

        Cache::forget('devises_actives');

        return $devise->fresh();
    }

    // =========================================================================
    // PRIVATE — cached currency list to avoid hitting the DB on every conversion
    // =========================================================================

    private function getDevises(): \Illuminate\Support\Collection
    {
        return Cache::remember('devises_actives', self::CACHE_TTL, fn() =>
            Devise::where('actif', true)->get()
        );
    }
}
