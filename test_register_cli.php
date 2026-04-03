<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);

$request = Illuminate\Http\Request::create('/register', 'POST', [
    'raison_sociale' => 'Sarl Omega Import-Export 2',
    'nif'            => '000012345600000',
    'nis'            => '123456789000000',
    'rc'             => '16B1234000',
    'type_client'    => 'ORDINAIRE',
    'adresse_siege'  => 'Zone Industrielle Rouiba',
    'ville'          => 'Alger',
    'pays_id'        => 1,
    'rep_nom'        => 'Benali',
    'rep_prenom'     => 'Karim',
    'rep_role'       => 'DG',
    'rep_tel'        => '+213 555 12 34 56',
    'rep_email'      => 'k.benali16@omega.dz',
    'password'       => 'SecurePass2026!',
    'password_confirmation' => 'SecurePass2026!',
    '_token'         => 'csrf_token_here'
]);

// Avoid session null errors in tests
$session = new Illuminate\Session\Store('test', new Illuminate\Session\NullSessionHandler());
$request->setLaravelSession($session);

app()->instance('request', $request);

try {
    $controller = app()->make(\App\Http\Controllers\Blade\BladeAuthController::class);
    $response = $controller->register($request);
    echo "SUCCESS: Status " . $response->getStatusCode() . "\n";
    if ($response->isRedirect()) {
        echo "Redirects to: " . $response->getTargetUrl() . "\n";
    }
} catch (\Illuminate\Validation\ValidationException $e) {
    echo "VALIDATION FAILED:\n";
    print_r($e->errors());
} catch (\Exception $e) {
    echo "EXCEPTION: " . $e->getMessage() . "\n";
    echo $e->getTraceAsString();
}
