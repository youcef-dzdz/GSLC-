<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Pays extends Model
{
    use HasFactory;

    protected $fillable = [
        'nom_pays',
        'code_iso',
        'indicatif_tel',
        'devise_defaut',
        'actif',
    ];

    protected function casts(): array
    {
        return [
            'actif' => 'boolean',
        ];
    }

    // Un pays a plusieurs ports
    public function ports()
    {
        return $this->hasMany(Port::class);
    }

    // Un pays a plusieurs clients
    public function clients()
    {
        return $this->hasMany(Client::class);
    }

    // Un pays a plusieurs transitaires
    public function transitaires()
    {
        return $this->hasMany(Transitaire::class);
    }
}