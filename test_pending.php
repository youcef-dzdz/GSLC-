<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$clients = App\Models\Client::where('statut','EN_ATTENTE_VALIDATION')->get(['id','raison_sociale','rep_email']);
foreach ($clients as $c) {
    echo $c->id . ' | ' . $c->raison_sociale . ' | ' . $c->rep_email . "\n";
}
