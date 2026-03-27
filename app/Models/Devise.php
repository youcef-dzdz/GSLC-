<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Devise extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'nom',
        'symbole',
        'taux_actuel',
        'taux_base',
        'date_derniere_maj',
        'source',
        'actif',
    ];

    protected function casts(): array
    {
        return [
            'taux_actuel'       => 'decimal:4',
            'taux_base'         => 'decimal:4',
            'date_derniere_maj' => 'date',
            'actif'             => 'boolean',
        ];
    }

    public function factures()
    {
        return $this->hasMany(Facture::class);
    }

    public function penalites()
    {
        return $this->hasMany(Penalite::class);
    }

    // Convertit un montant en DZD
    public function convertirEnDZD(float $montant): float
    {
        return round($montant * $this->taux_actuel, 2);
    }
}