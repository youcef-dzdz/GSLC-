<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class BladeRole
{
    public function handle(Request $request, Closure $next, string $role)
    {
        $user = Auth::user();

        // Admin can access all staff areas
        if ($user->role->label === 'admin') {
            return $next($request);
        }

        if ($user->role->label !== $role) {
            abort(403, "Accès réservé au service {$role}. Votre profil : {$user->serviceLabel()}.");
        }

        return $next($request);
    }
}
