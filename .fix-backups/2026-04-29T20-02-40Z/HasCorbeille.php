<?php

namespace App\Traits;

use App\Models\Corbeille;
use Illuminate\Database\Eloquent\Collection;

trait HasCorbeille
{
    public function moveToCorbeille(int $deletedById, ?string $deletedByIp = null): void
    {
        $actor = \App\Models\User::with('role')->find($deletedById);

        // Derive user name from prenoms & noms
        $actorName = $actor ? trim(($actor->prenom ?? '') . ' ' . ($actor->nom ?? '')) : 'Inconnu';
        if (empty($actorName)) {
            $actorName = 'Inconnu';
        }

        // Derive role safely
        $actorRole = null;
        if ($actor && $actor->role) {
            $actorRole = $actor->role->label ?? $actor->role->nom_role ?? null;
        }

        Corbeille::create([
            'model_type'       => static::class,
            'model_id'         => $this->id,
            'snapshot'         => $this->toArray(),
            'deleted_by'       => $deletedById,
            'deleted_by_name'  => $actorName,
            'deleted_by_email' => $actor->email ?? 'Inconnu',
            'deleted_by_role'  => $actorRole,
            'deleted_by_ip'    => $deletedByIp,
            'deleted_at_audit' => now(),
            'expires_at'       => now()->addDays(30)
        ]);

        $this->forceDelete();
    }

    public static function restoreFromCorbeille(int $corbeilleId, int $restoredById, ?string $restoredByIp = null): bool
    {
        $corbeille = Corbeille::find($corbeilleId);

        if (!$corbeille) {
            return false;
        }

        if ($corbeille->expires_at <= now()) {
            return false;
        }

        static::create(
            collect($corbeille->snapshot)
                ->except(['id', 'created_at', 'updated_at'])
                ->toArray()
        );

        $actor = \App\Models\User::find($restoredById);

        $actorName = $actor ? trim(($actor->prenom ?? '') . ' ' . ($actor->nom ?? '')) : 'Inconnu';
        if (empty($actorName)) {
            $actorName = 'Inconnu';
        }

        $corbeille->update([
            'restored_at'       => now(),
            'restored_by'       => $restoredById,
            'restored_by_name'  => $actorName,
            'restored_by_email' => $actor->email ?? 'Inconnu',
            'restored_by_ip'    => $restoredByIp,
        ]);

        return true;
    }

    public static function corbeilleItems(): Collection
    {
        return Corbeille::where('model_type', static::class)
            ->orderByDesc('deleted_at_audit')
            ->get();
    }
}
