<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StatutConteneur extends Model
{
    use HasFactory;

    protected $table = 'statut_conteneurs';

    protected $fillable = [
        'conteneur_id',
        'ancien_statut',
        'nouveau_statut',
        'responsable_id',
        'date_changement',
        'commentaire',
    ];

    protected function casts(): array
    {
        return [
            'date_changement' => 'datetime',
        ];
    }

    // Appartient à un conteneur
    public function conteneur()
    {
        return $this->belongsTo(Conteneur::class);
    }

    // Enregistré par un employé NASHCO
    public function responsable()
    {
        return $this->belongsTo(User::class, 'responsable_id');
    }
}