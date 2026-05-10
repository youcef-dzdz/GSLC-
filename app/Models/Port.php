<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\HasCorbeille;

class Port extends Model
{
    use HasFactory, SoftDeletes, HasCorbeille;

    protected $fillable = [
        'pays_id',
        'nom_port',
        'code_port',
        'ville',
        'type_port',
        'adresse',
        'telephone',
        'jours_allowance_defaut',
        'actif',
    ];

    protected function casts(): array
    {
        return [
            'actif'                  => 'boolean',
            'jours_allowance_defaut' => 'integer',
        ];
    }

    // Appartient à un pays
    public function pays()
    {
        return $this->belongsTo(Pays::class);
    }

    // Un port a plusieurs terminaux
    public function terminaux()
    {
        return $this->hasMany(Terminal::class);
    }

    // Un port a plusieurs escales
    public function escales()
    {
        return $this->hasMany(Escale::class);
    }

    // Un port a plusieurs dépots
    public function depots()
    {
        return $this->hasMany(Depot::class);
    }
}