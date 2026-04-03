<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

// Approve "Sarl Test Browser" (id=6)
$client = App\Models\Client::find(6);
if (!$client) { echo "Not found!\n"; exit(1); }

echo "Name: {$client->raison_sociale}\n";
echo "Email: {$client->rep_email}\n";
echo "Status BEFORE: {$client->statut}\n";

$client->update([
    'statut'             => 'APPROUVE',
    'date_validation'    => now(),
    'valide_par_user_id' => 1
]);
$client->user->update(['statut' => 'ACTIF']);

// Also reset password to a known value
$client->user->update(['password' => Illuminate\Support\Facades\Hash::make('test1234')]);

$client->refresh();
echo "Status AFTER: {$client->statut}\n";
echo "User status: {$client->user->statut}\n";
echo "Password reset to: test1234\n";
echo "Login with: {$client->rep_email} / test1234\n";
