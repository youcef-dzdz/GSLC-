<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ConditionsGenerales extends Model
{
    use HasFactory;

    protected $table = 'conditions_generales';

    protected $fillable = [
        'version',
        'titre',
        'contenu',
        'actif',
        'cree_par_user_id',
        'date_application',
    ];

    protected function casts(): array
    {
        return [
            'actif'            => 'boolean',
            'date_application' => 'datetime',
        ];
    }

    // Créé par un employé NASHCO
    public function creePar()
    {
        return $this->belongsTo(User::class, 'cree_par_user_id');
    }

    // Liée à plusieurs contrats
    public function contrats()
    {
        return $this->hasMany(ContratImport::class);
    }

    // Récupère la version active
    public static function getVersionActive()
    {
        return self::where('actif', true)->first();
    }
}