<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Conteneur extends Model
{
    use HasFactory;

    protected $fillable = [
        'numero_conteneur',
        'type_id',
        'proprietaire',
        'hauteur',
        'largeur',
        'poids_max',
        'etat_actuel',
        'statut',
        'temperature',
        'date_achat',
    ];

    protected function casts(): array
    {
        return [
            'hauteur'     => 'decimal:2',
            'largeur'     => 'decimal:2',
            'poids_max'   => 'decimal:2',
            'temperature' => 'decimal:2',
            'date_achat'  => 'date',
        ];
    }

    // Appartient à un type de conteneur
    public function type()
    {
        return $this->belongsTo(TypeConteneur::class, 'type_id');
    }

    // Historique des statuts
    public function statutsHistorique()
    {
        return $this->hasMany(StatutConteneur::class);
    }

    // Historique des mouvements
    public function mouvements()
    {
        return $this->hasMany(MouvementConteneur::class);
    }

    // Emplacement actuel
    public function emplacement()
    {
        return $this->hasOne(Emplacement::class);
    }

    // Demandes liées
    public function demandeConteneurs()
    {
        return $this->hasMany(DemandeConteneur::class);
    }

    // Vérifie si disponible
    public function estDisponible(): bool
    {
        return $this->statut === 'DISPONIBLE' && $this->etat_actuel === 'BON_ETAT';
    }
}