<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\SoftDeletes;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    protected $fillable = [
        'role_id',
        'department_id',
        'position',
        'position_id',
        'nom',
        'prenom',
        'email',
        'password',
        'statut',
        'tentatives_echouees',
        'derniere_connexion',
        'must_change_password',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'password' => 'hashed',
            'derniere_connexion' => 'datetime',
            'tentatives_echouees' => 'integer',
        ];
    }

    public function role()
    {
        return $this->belongsTo(Role::class);
    }

    public function department()
    {
        return $this->belongsTo(Department::class, 'department_id');
    }

    /**
     * Relationship to the normalized Position record.
     * Named positionRelation to avoid collision with the legacy `position` column.
     */
    public function positionRelation()
    {
        return $this->belongsTo(Position::class, 'position_id');
    }

    public function getPositionAttribute(): ?string
    {
        return $this->positionRelation?->title ?? $this->getRawOriginal('position');
    }

    /**
     * Associated client record (if any).
     */
    public function client()
    {
        return $this->hasOne(Client::class);
    }

    public function permissions()
    {
        return $this->role ? $this->role->permissions : collect();
    }


    public function isResponsable(): bool
    {
        return str_contains($this->position ?? '', 'Responsable')
            || str_contains($this->position ?? '', 'Directeur')
            || str_contains($this->position ?? '', 'Administrateur');
    }

    public function isAgent(): bool
    {
        return str_contains($this->position ?? '', 'Agent');
    }

    public function serviceLabel(): string
    {
        return match ($this->role->label) {
            'admin' => 'Administration',
            'directeur' => 'Direction Générale',
            'commercial' => 'Service Commercial',
            'logistique' => 'Service Logistique',
            'financier' => 'Service Financier',
            'client' => 'Portail Client',
            default => 'Inconnu',
        };
    }

    public function userPermissions()
    {
        return $this->hasMany(UserPermission::class);
    }

    /**
     * Checks if the user's role has the given permission slug.
     * Uses relationship caching to avoid N+1 queries.
     */
    public function hasPermission(string $slug): bool
    {
        // Ensure role and permissions are loaded and cached
        if (!$this->relationLoaded('role')) {
            $this->load('role.permissions');
        }

        $role = $this->role;
        if (!$role) return false;

        $permissions = $role->permissions;

        // Superadmin fallback: niveau 1 and NO permissions assigned to the role
        // This allows bootstraping the initial admin account.
        if ($role->niveau === 1 && $permissions->isEmpty()) {
            return true;
        }

        // Check if the permission slug exists in the role's permissions
        return $permissions->contains('name', $slug);
    }

    public function syncPermissions(array $permissions): void
    {
        foreach ($permissions as $permissionName => $granted) {
            $perm = Permission::where('name', $permissionName)->first();
            if (!$perm) continue;
            UserPermission::updateOrCreate(
                ['user_id' => $this->id, 'permission_id' => $perm->id],
                ['granted' => (bool) $granted]
            );
        }
    }

}