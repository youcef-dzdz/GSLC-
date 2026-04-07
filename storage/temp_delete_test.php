<?php
require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$admin = App\Models\User::whereHas('role', function($q){ $q->where('label','admin'); })->first();
$token = $admin->createToken('test-token')->plainTextToken;
echo "ADMIN_ID: " . $admin->id . "\n";
echo "TOKEN: " . $token . "\n";

