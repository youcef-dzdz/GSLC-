<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LigneDemande extends Model
{
    use HasFactory;

    protected $table = 'lignes_demande';

    protected $fillable = [
        'demande_id',
        'marchandise_id',
        'type_conteneur_id',
        'pays_origine_id',
        'quantite',
        'poids_total',
        'volume',
        'unite',
        'description',
    ];

    protected function casts(): array
    {
        return [
            'quantite'    => 'integer',
            'poids_total' => 'decimal:2',
            'volume'      => 'decimal:2',
        ];
    }

    // Appartient à une demande
    public function demande()
    {
        return $this->belongsTo(DemandeImport::class, 'demande_id');
    }

    // Appartient à une marchandise
    public function marchandise()
    {
        return $this->belongsTo(Marchandise::class);
    }

    // Appartient à un type de conteneur
    public function typeConteneur()
    {
        return $this->belongsTo(TypeConteneur::class);
    }

    // Pays d'origine de la marchandise
    public function paysOrigine()
    {
        return $this->belongsTo(Pays::class, 'pays_origine_id');
    }
}