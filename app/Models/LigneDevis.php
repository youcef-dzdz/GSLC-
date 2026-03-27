<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LigneDevis extends Model
{
    use HasFactory;

    protected $table = 'lignes_devis';

    protected $fillable = [
        'devis_id',
        'tarif_service_id',
        'type_ligne',
        'service',
        'description',
        'quantite',
        'prix_unitaire',
        'tva_applicable',
        'total_ht',
        'modification_proposee',
        'nouveau_prix_propose',
    ];

    protected function casts(): array
    {
        return [
            'quantite'            => 'integer',
            'prix_unitaire'       => 'decimal:2',
            'total_ht'            => 'decimal:2',
            'nouveau_prix_propose'=> 'decimal:2',
            'tva_applicable'      => 'boolean',
        ];
    }

    // Appartient à un devis
    public function devis()
    {
        return $this->belongsTo(Devis::class);
    }

    // Appartient à un tarif service
    public function tarifService()
    {
        return $this->belongsTo(TarifService::class);
    }

    // Calcule le montant TVA de cette ligne
    public function montantTva(): float
    {
        if (!$this->tva_applicable) return 0;
        return round($this->total_ht * 0.19, 2);
    }

    // Calcule le total TTC de cette ligne
    public function totalTtc(): float
    {
        return $this->total_ht + $this->montantTva();
    }
}