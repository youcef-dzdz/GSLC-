<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\HasCorbeille;

class Banque extends Model
{
    use HasFactory, SoftDeletes, HasCorbeille;

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