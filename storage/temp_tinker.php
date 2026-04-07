<?php
require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "\n--- USERS ---\n";
echo json_encode(
  App\Models\User::with(['role','department'])
    ->get()
    ->map(function($u) {
        return [
            'id'   => $u->id,
            'nom'  => $u->nom,
            'dept_id'   => $u->department_id,
            'dept_name' => $u->department ? $u->department->name : null,
            'dept_code' => $u->department ? $u->department->code : null,
            'role' => $u->role ? $u->role->nom_role : null,
        ];
    })
);
echo "\n\n--- DEPARTMENTS ---\n";
echo json_encode(\DB::table('departments')->get());
echo "\n";
