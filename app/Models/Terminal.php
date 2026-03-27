<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Terminal extends Model
{
    use HasFactory;

    protected $table = 'terminaux';

    protected $fillable = [
        'port_id',
        'code_terminal',
        'nom_terminal',
        'adresse',
        'telephone',
        'email',
        'capacite_max_teu',
        'responsable',
        'taux_occupation',
        'actif',
    ];

    protected function casts(): array
    {
        return [
            'capacite_max_teu' => 'integer',
            'taux_occupation'  => 'decimal:2',
            'actif'            => 'boolean',
        ];
    }

    // Appartient à un port
    public function port()
    {
        return $this->belongsTo(Port::class);
    }

    // Un terminal a plusieurs dépots
    public function depots()
    {
        return $this->hasMany(Depot::class);
    }

    // Un terminal a plusieurs conteneurs
    public function conteneurs()
    {
        return $this->hasMany(Conteneur::class);
    }

    // Calcule les places libres
    public function placesLibres(): int
    {
        $occupes = $this->conteneurs()->count();
        return $this->capacite_max_teu - $occupes;
    }

    // Vérifie si le terminal peut accepter des conteneurs
    public function estDisponible(): bool
    {
        return $this->actif && $this->placesLibres() > 0;
    }
}