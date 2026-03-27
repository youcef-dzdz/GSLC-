<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Role extends Model
{
    use HasFactory;

    protected $fillable = [
        'nom_role',
        'label',
        'description',
        'niveau',
    ];

    protected function casts(): array
    {
        return [
            'niveau' => 'integer',
        ];
    }

    // Un role a plusieurs users
    public function users()
    {
        return $this->hasMany(User::class);
    }

    // Un role a plusieurs permissions (table pivot permission_role)
    public function permissions()
    {
        return $this->belongsToMany(Permission::class, 'permission_role');
    }
}