<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Banque extends Model
{
    use HasFactory;

    protected $fillable = [
        'nom',
        'code_banque',
        'adresse',
        'telephone',
        'swift',
        'actif',
    ];

    protected function casts(): array
    {
        return [
            'actif' => 'boolean',
        ];
    }

    // Une banque est liée à plusieurs contrats
    public function contrats()
    {
        return $this->hasMany(ContratImport::class);
    }

    // Une banque est liée à plusieurs paiements
    public function paiements()
    {
        return $this->hasMany(Paiement::class);
    }
}