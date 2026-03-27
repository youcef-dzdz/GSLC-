<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LigneContrat extends Model
{
    use HasFactory;

    protected $table = 'lignes_contrat';

    protected $fillable = [
        'contrat_id',
        'tarif_service_id',
        'type_conteneur_id',
        'type_ligne',
        'service',
        'description',
        'quantite',
        'nombre_conteneurs',
        'prix_unitaire',
        'tva_applicable',
        'total_ht',
        'franchise_jours',
        'date_debut',
        'date_fin',
    ];

    protected function casts(): array
    {
        return [
            'quantite'         => 'integer',
            'nombre_conteneurs'=> 'integer',
            'franchise_jours'  => 'integer',
            'prix_unitaire'    => 'decimal:2',
            'total_ht'         => 'decimal:2',
            'tva_applicable'   => 'boolean',
            'date_debut'       => 'date',
            'date_fin'         => 'date',
        ];
    }

    public function contrat()
    {
        return $this->belongsTo(ContratImport::class, 'contrat_id');
    }

    public function tarifService()
    {
        return $this->belongsTo(TarifService::class);
    }

    public function typeConteneur()
    {
        return $this->belongsTo(TypeConteneur::class);
    }

    public function montantTva(): float
    {
        if (!$this->tva_applicable) return 0;
        return round($this->total_ht * 0.19, 2);
    }

    public function totalTtc(): float
    {
        return $this->total_ht + $this->montantTva();
    }
}