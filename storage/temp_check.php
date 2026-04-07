<?php
require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$user = App\Models\User::with(['role','department'])->first();
echo json_encode($user, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
echo "\n";
