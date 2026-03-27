<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Navire extends Model
{
    use HasFactory;

    protected $fillable = [
        'nom_navire',
        'numero_imo',
        'pays_id',
        'compagnie_maritime',
        'capacite_teu',
        'annee_construction',
        'actif',
    ];

    protected function casts(): array
    {
        return [
            'capacite_teu'        => 'integer',
            'annee_construction'  => 'integer',
            'actif'               => 'boolean',
        ];
    }

    // Appartient à un pays (pavillon)
    public function pays()
    {
        return $this->belongsTo(Pays::class);
    }

    // Un navire a plusieurs escales
    public function escales()
    {
        return $this->hasMany(Escale::class);
    }

    // Un navire a plusieurs conteneurs
    public function conteneurs()
    {
        return $this->hasMany(Conteneur::class);
    }
}