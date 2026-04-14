<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Models\Role;
use App\Models\Permission;

$email = 'mokhtari.yusif@gmail.com';
$user = User::where('email', $email)->with('role.permissions')->first();

if (!$user) {
    echo "User $email not found.\n";
    exit(1);
}

echo "User: " . $user->nom . " " . $user->prenom . "\n";
echo "Role: " . $user->role->label . " (Niveau: " . $user->role->level . ")\n";
echo "Permissions count: " . $user->role->permissions->count() . "\n";
echo "Permissions list: " . implode(', ', $user->role->permissions->pluck('name')->toArray()) . "\n";

// List all roles for comparison
echo "\nAll roles in DB:\n";
Role::all()->each(function($r) {
    echo "  [" . $r->id . "] " . $r->label . " (Level: " . $r->level . ")\n";
});
