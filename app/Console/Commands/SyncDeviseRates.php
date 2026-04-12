<?php

namespace App\Console\Commands;

use App\Services\DeviseService;
use Illuminate\Console\Command;

class SyncDeviseRates extends Command
{
    protected $signature   = 'devise:sync';
    protected $description = 'Fetch live exchange rates from frankfurter.app and update the devises table';

    public function handle(DeviseService $service): int
    {
        $this->info('Synchronisation des taux de change...');

        $result = $service->syncRates();

        if ($result['updated'] > 0) {
            $this->info('✅ ' . $result['message']);
            if (isset($result['eur_to_dzd'])) {
                $this->line('   1 EUR = ' . $result['eur_to_dzd'] . ' DZD');
            }
        } else {
            $this->warn('⚠️  ' . $result['message']);
        }

        return self::SUCCESS;
    }
}
