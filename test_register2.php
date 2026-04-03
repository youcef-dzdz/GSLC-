<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$req = Illuminate\Http\Request::create("/register", "POST", [
    "raison_sociale" => "Sarl Omega", 
    "nif" => "000012300".rand(), 
    "nis" => "1234500".rand(), 
    "rc" => "16B12".rand(), 
    "type_client" => "ORDINAIRE", 
    "adresse_siege" => "ZI", 
    "ville" => "Alger", 
    "pays_id" => 1, 
    "rep_nom" => "B", 
    "rep_prenom" => "K", 
    "rep_role" => "DG", 
    "rep_tel" => "123", 
    "rep_email" => "k.".rand()."@o.dz", 
    "password" => "SecurePass2026!", 
    "password_confirmation" => "SecurePass2026!"
]);
$req->setSession($app["session.store"]);
try {
    $app->make(\App\Http\Controllers\Blade\BladeAuthController::class)->register($req);
    echo "SUCCESS\n";
} catch(\Illuminate\Validation\ValidationException $e) {
    print_r($e->errors());
} catch(\Exception $e) {
    echo get_class($e) . ': ' . $e->getMessage() . "\n" . $e->getTraceAsString();
}
