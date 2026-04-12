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
        return $this->role->permissions ?? collect();
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

    public function hasPermission(string $permission): bool
    {
        if ($this->role->label === 'admin') {
            return true;
        }

        if ($this->isResponsable()) {
            return true;
        }

        $perm = $this->userPermissions()
                     ->where('permission', $permission)
                     ->first();

        return $perm ? (bool) $perm->valeur : false;
    }

    public function syncPermissions(array $permissions): void
    {
        foreach ($permissions as $permission => $valeur) {
            UserPermission::updateOrCreate(
                ['user_id' => $this->id, 'permission' => $permission],
                ['valeur' => (bool) $valeur]
            );
        }
    }

}