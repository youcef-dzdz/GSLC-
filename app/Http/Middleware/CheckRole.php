<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Handle an incoming request.
     *
     * Usage in routes:
     *   Route::middleware('role:admin')
     *   Route::middleware('role:admin,directeur')
     *
     * @param string $roles — comma-separated list of allowed role labels
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        // 1. Is the user logged in at all?
        if (! $request->user()) {
            return response()->json([
                'message' => 'Non authentifié. Veuillez vous connecter.',
            ], 401);
        }

        // 2. Does the user have a role assigned?
        $user = $request->user();

        if (! $user->role) {
            return response()->json([
                'message' => 'Aucun rôle assigné à cet utilisateur.',
            ], 403);
        }

        // 3. Is the user's role in the allowed list?
        // $roles comes from the route definition e.g. 'role:admin,directeur'
        if (! in_array($user->role->label, $roles)) {
            // Règle spéciale : tout rôle niveau 1 peut accéder
            // aux routes admin — ses permissions individuelles
            // contrôlent ce qu'il peut faire (RBAC granulaire)
            $routePrefix = $request->route()?->getPrefix() ?? '';
            $userNiveau  = $user->role->niveau ?? 99;

            if (str_starts_with($routePrefix, 'admin')
                && $userNiveau === 1) {
                return $next($request);
            }

            return response()->json([
                'message'      => 'Accès refusé. Vous n\'avez pas les permissions nécessaires.',
                'votre_role'   => $user->role->label,
                'roles_requis' => $roles,
            ], 403);
        }

        // 4. Is the user account active?
        if ($user->statut !== 'ACTIF') {
            return response()->json([
                'message' => 'Votre compte est ' . strtolower($user->statut) . '. Contactez l\'administrateur.',
            ], 403);
        }

        // All checks passed — let the request through
        return $next($request);
    }
}
