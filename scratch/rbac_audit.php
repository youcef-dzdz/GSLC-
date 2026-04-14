<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Models\Role;

echo "Users: " . User::count() . PHP_EOL;
Role::withCount('users')->with('permissions')->orderBy('niveau')->get()->each(function($r) {
    echo "  [" . $r->label . "] " . $r->users_count . " users, " . $r->permissions->count() . " permissions" . PHP_EOL;
});
