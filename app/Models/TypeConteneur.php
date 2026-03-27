<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TypeConteneur extends Model
{
    use HasFactory;

    protected $table = 'types_conteneur';

    protected $fillable = [
        'code_type',
        'libelle',
        'longueur_pieds',
        'est_frigo',
        'poids_tare',
        'charge_utile',
        'volume',
        'tarif_journalier_defaut',
        'actif',
    ];

    protected function casts(): array
    {
        return [
            'longueur_pieds'          => 'integer',
            'est_frigo'               => 'boolean',
            'poids_tare'              => 'decimal:2',
            'charge_utile'            => 'decimal:2',
            'volume'                  => 'decimal:2',
            'tarif_journalier_defaut' => 'decimal:2',
            'actif'                   => 'boolean',
        ];
    }

    // Un type a plusieurs conteneurs
    public function conteneurs()
    {
        return $this->hasMany(Conteneur::class);
    }

    // Un type a plusieurs tarifs service
    public function tarifsService()
    {
        return $this->hasMany(TarifService::class);
    }

    // Un type a plusieurs penalites
    public function penalites()
    {
        return $this->hasMany(Penalite::class);
    }
}