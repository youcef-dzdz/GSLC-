<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class BladePermission
{
    protected string $permission;

    public function __construct(string $permission)
    {
        $this->permission = $permission;
    }

    public function handle(Request $request, Closure $next)
    {
        $user = Auth::user();

        if (!$user->hasPermission($this->permission)) {
            if ($request->expectsJson()) {
                return response()->json(['message' => 'Permission refusée.'], 403);
            }
            return back()->with('error', "Vous n'avez pas la permission d'effectuer cette action.");
        }

        return $next($request);
    }
}
