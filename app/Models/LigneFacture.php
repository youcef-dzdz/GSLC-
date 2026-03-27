<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LigneFacture extends Model
{
    use HasFactory;

    protected $table = 'lignes_facture';

    protected $fillable = [
        'facture_id',
        'tarif_service_id',
        'calcul_penalite_id',
        'type_ligne',
        'description',
        'quantite',
        'prix_unitaire',
        'tva_applicable',
        'total_ht',
    ];

    protected function casts(): array
    {
        return [
            'quantite'       => 'integer',
            'prix_unitaire'  => 'decimal:2',
            'total_ht'       => 'decimal:2',
            'tva_applicable' => 'boolean',
        ];
    }

    public function facture()
    {
        return $this->belongsTo(Facture::class);
    }

    public function tarifService()
    {
        return $this->belongsTo(TarifService::class);
    }

    public function calculPenalite()
    {
        return $this->belongsTo(CalculPenalite::class, 'calcul_penalite_id');
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