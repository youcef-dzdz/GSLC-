<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\HasCorbeille;

class TarifService extends Model
{
    use HasFactory, SoftDeletes, HasCorbeille;

    protected $table = 'tarifs_service';

    protected $fillable = [
        'code_tarif',
        'libelle_service',
        'type_conteneur_id',
        'montant_unitaire',
        'unite',
        'tva_applicable',
        'date_debut',
        'date_fin',
        'actif',
    ];

    protected function casts(): array
    {
        return [
            'montant_unitaire' => 'decimal:2',
            'tva_applicable'   => 'boolean',
            'date_debut'       => 'date',
            'date_fin'         => 'date',
            'actif'            => 'boolean',
        ];
    }

    // Appartient à un type de conteneur
    public function typeConteneur()
    {
        return $this->belongsTo(TypeConteneur::class);
    }

    // Un tarif apparait dans plusieurs lignes de devis
    public function lignesDevis()
    {
        return $this->hasMany(LigneDevis::class);
    }

    // Un tarif apparait dans plusieurs lignes de facture
    public function lignesFacture()
    {
        return $this->hasMany(LigneFacture::class);
    }
}