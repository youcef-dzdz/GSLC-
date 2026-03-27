<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Franchise extends Model
{
    use HasFactory;

    protected $fillable = [
        'type_conteneur_id',
        'port_id',
        'client_id',
        'type_franchise',
        'jours_franchise',
        'description',
        'date_debut_validite',
        'date_fin_validite',
        'actif',
    ];

    protected function casts(): array
    {
        return [
            'jours_franchise'     => 'integer',
            'date_debut_validite' => 'date',
            'date_fin_validite'   => 'date',
            'actif'               => 'boolean',
        ];
    }

    public function typeConteneur()
    {
        return $this->belongsTo(TypeConteneur::class);
    }

    public function port()
    {
        return $this->belongsTo(Port::class);
    }

    public function client()
    {
        return $this->belongsTo(Client::class);
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