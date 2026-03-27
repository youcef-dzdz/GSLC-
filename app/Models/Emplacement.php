<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Emplacement extends Model
{
    use HasFactory;

    protected $fillable = [
        'depot_id',
        'code_emplacement',
        'zone',
        'allee',
        'rangee',
        'hauteur_niveau',
        'occupe',
        'conteneur_id',
    ];

    protected function casts(): array
    {
        return [
            'hauteur_niveau' => 'integer',
            'occupe'         => 'boolean',
        ];
    }

    // Appartient à un dépôt
    public function depot()
    {
        return $this->belongsTo(Depot::class);
    }

    // Contient un conteneur (optionnel)
    public function conteneur()
    {
        return $this->belongsTo(Conteneur::class);
    }

    // Vérifie si l'emplacement est libre
    public function estLibre(): bool
    {
        return !$this->occupe && !$this->conteneur_id;
    }
}