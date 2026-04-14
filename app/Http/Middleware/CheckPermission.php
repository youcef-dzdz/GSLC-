<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckPermission
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string $permission): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        // Eager load role and permissions to avoid N+1 queries during permission checks
        $user->loadMissing('role.permissions');

        if (!$user->hasPermission($permission)) {
            return response()->json([
                'message' => 'Forbidden — permission denied',
                'required_permission' => $permission
            ], 403);
        }

        return $next($request);
    }
}
