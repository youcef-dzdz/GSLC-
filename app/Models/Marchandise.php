<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Marchandise extends Model
{
    use HasFactory;

    protected $table = 'marchandises';

    protected $fillable = [
        'code_hs',
        'libelle',
        'classe_dangereuse',
        'necessite_frigo',
        'temperature_min',
        'temperature_max',
        'actif',
    ];

    protected function casts(): array
    {
        return [
            'necessite_frigo' => 'boolean',
            'temperature_min' => 'decimal:2',
            'temperature_max' => 'decimal:2',
            'actif'           => 'boolean',
        ];
    }

    // Une marchandise apparait dans plusieurs lignes de demande
    public function lignesDemande()
    {
        return $this->hasMany(LigneDemande::class);
    }
}