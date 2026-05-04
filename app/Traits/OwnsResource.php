<?php

namespace App\Traits;

use Illuminate\Database\Eloquent\Model;

trait OwnsResource
{
    // =========================================================================
    // Method 1 — Enforce user_id ownership on a resource
    // =========================================================================

    /**
     * Aborts with 403 if the authenticated user does not own the resource.
     * Staff at niveau <= 3 (Admin, Directeur, Responsable) bypass the check.
     * Agents (niveau 4) and Secrétaires (niveau 5) must match $resource->{$ownerKey}.
     *
     * @param  Model   $resource   The Eloquent record to check ownership on
     * @param  string  $ownerKey   The column on $resource holding the owner's user ID (default: 'user_id')
     *
     * @throws \Symfony\Component\HttpKernel\Exception\HttpException  401 or 403
     */
    protected function authorizeOwnership(
        Model $resource,
        string $ownerKey = 'user_id'
    ): void {
        $user = auth()->user();

        if (!$user) {
            abort(401);
        }

        // ── Staff bypass: Admin / Directeur / Responsable see all resources ──
        try {
            if ($user->role && $user->role->niveau <= 3) {
                return;
            }
        } catch (\Throwable) {
            // role relation not loaded or niveau missing — fall through to strict check
        }

        // ── Ownership check: authenticated user must own this record ──
        if ((int) $resource->{$ownerKey} === (int) $user->id) {
            return;
        }

        abort(403, 'Accès refusé. Vous ne pouvez accéder qu\'à vos propres ressources.');
    }

    // =========================================================================
    // Method 2 — Enforce client_id ownership for client-portal resources
    // =========================================================================

    /**
     * Aborts with 403 if the authenticated user's client record does not own
     * the resource. Staff at niveau <= 3 bypass the check.
     * Client users must have a linked Client record and its ID must match
     * $resource->{$clientForeignKey}.
     *
     * @param  Model   $resource           The Eloquent record to check
     * @param  string  $clientForeignKey   Column on $resource holding the client_id (default: 'client_id')
     *
     * @throws \Symfony\Component\HttpKernel\Exception\HttpException  401 or 403
     */
    protected function authorizeClientOwnership(
        Model $resource,
        string $clientForeignKey = 'client_id'
    ): void {
        $user = auth()->user();

        if (!$user) {
            abort(401);
        }

        // ── Staff bypass ──
        try {
            if ($user->role && $user->role->niveau <= 3) {
                return;
            }
        } catch (\Throwable) {
            // fall through to strict check
        }

        // ── Resolve the user's client profile ──
        try {
            if (!$user->relationLoaded('client')) {
                $user->load('client');
            }
        } catch (\Throwable) {
            // load failed — deny
            abort(403, 'Accès refusé. Vous ne pouvez accéder qu\'à vos propres ressources.');
        }

        if (!$user->client) {
            // Authenticated but has no client profile — deny
            abort(403, 'Accès refusé. Vous ne pouvez accéder qu\'à vos propres ressources.');
        }

        // ── Ownership check ──
        if ((int) $resource->{$clientForeignKey} === (int) $user->client->id) {
            return;
        }

        abort(403, 'Accès refusé. Vous ne pouvez accéder qu\'à vos propres ressources.');
    }

    // =========================================================================
    // Method 3 — Check if authenticated user is internal staff (niveau <= 3)
    // =========================================================================

    /**
     * Returns true if the authenticated user is staff (Admin, Directeur, Responsable).
     * Safe to call at any time — returns false on any auth/relation failure.
     */
    protected function isStaff(): bool
    {
        try {
            $user = auth()->user();
            return $user && $user->role && $user->role->niveau <= 3;
        } catch (\Throwable) {
            return false;
        }
    }

    // =========================================================================
    // Method 4 — Check if authenticated user is Admin or IT (niveau <= 1)
    // =========================================================================

    /**
     * Returns true if the authenticated user is an administrator (niveau 1).
     * Safe to call at any time — returns false on any auth/relation failure.
     */
    protected function isAdmin(): bool
    {
        try {
            $user = auth()->user();
            return $user && $user->role && $user->role->niveau <= 1;
        } catch (\Throwable) {
            return false;
        }
    }
}
