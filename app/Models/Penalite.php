<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Penalite extends Model
{
    use HasFactory;

    protected $fillable = [
        'type_conteneur_id',
        'devise_id',
        'type',
        'tarif_journalier',
        'tranche_debut',
        'tranche_fin',
        'date_debut_validite',
        'date_fin_validite',
        'actif',
    ];

    protected function casts(): array
    {
        return [
            'tarif_journalier'    => 'decimal:2',
            'tranche_debut'       => 'integer',
            'tranche_fin'         => 'integer',
            'date_debut_validite' => 'date',
            'date_fin_validite'   => 'date',
            'actif'               => 'boolean',
        ];
    }

    public function typeConteneur()
    {
        return $this->belongsTo(TypeConteneur::class);
    }

    public function devise()
    {
        return $this->belongsTo(Devise::class);
    }

    public function calculPenalites()
    {
        return $this->hasMany(CalculPenalite::class);
    }

    public function estValide(): bool
    {
        if (!$this->actif) return false;
        if (!$this->date_fin_validite) return true;
        return $this->date_fin_validite->isFuture();
    }
}