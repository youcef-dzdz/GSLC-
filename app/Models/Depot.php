<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Depot extends Model
{
    use HasFactory;

    protected $table = 'depots';

    protected $fillable = [
        'port_id',
        'terminal_id',
        'code_depot',
        'nom_depot',
        'adresse_precise',
        'telephone',
        'email',
        'type_stockage',
        'capacite_totale',
        'responsable',
        'actif',
    ];

    protected function casts(): array
    {
        return [
            'capacite_totale' => 'integer',
            'actif'           => 'boolean',
        ];
    }

    // Appartient à un port
    public function port()
    {
        return $this->belongsTo(Port::class);
    }

    // Appartient à un terminal (optionnel)
    public function terminal()
    {
        return $this->belongsTo(Terminal::class);
    }

    // Un dépot a plusieurs emplacements
    public function emplacements()
    {
        return $this->hasMany(Emplacement::class);
    }

    // Un dépot a plusieurs conteneurs
    public function conteneurs()
    {
        return $this->hasMany(Conteneur::class);
    }

    // Calcule les places libres
    public function placesLibres(): int
    {
        $occupes = $this->emplacements()->where('occupe', true)->count();
        return $this->capacite_totale - $occupes;
    }

    // Vérifie si le dépot peut accepter des conteneurs
    public function estDisponible(): bool
    {
        return $this->actif && $this->placesLibres() > 0;
    }
}