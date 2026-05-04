<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Models\SystemConfig;
use Illuminate\Support\Facades\Config;

class DynamicMailConfigServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        try {
            $config = SystemConfig::whereIn('key', [
                'smtp_host', 'smtp_port', 'smtp_username',
                'smtp_password', 'smtp_from', 'smtp_from_name',
            ])->pluck('value', 'key')->toArray();

            if (!empty($config['smtp_host'])) {
                Config::set('mail.default', 'smtp');
                Config::set('mail.mailers.smtp.host',       $config['smtp_host']      ?? '');
                Config::set('mail.mailers.smtp.port',       $config['smtp_port']      ?? 587);
                Config::set('mail.mailers.smtp.username',   $config['smtp_username']  ?? '');
                Config::set('mail.mailers.smtp.password',   $config['smtp_password']  ?? '');
                Config::set('mail.mailers.smtp.encryption', 'tls');
                Config::set('mail.from.address',            $config['smtp_from']      ?? '');
                Config::set('mail.from.name',               $config['smtp_from_name'] ?? config('app.name'));
            }
        } catch (\Exception $e) {
            // DB not ready yet (migrations) — silently skip
        }
    }
}
