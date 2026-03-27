<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DemandeConteneur extends Model
{
    use HasFactory;

    protected $table = 'demande_conteneurs';

    protected $fillable = [
        'demande_id',
        'type_conteneur_id',
        'conteneur_id',
        'nombre_unites',
        'statut',
    ];

    protected function casts(): array
    {
        return [
            'nombre_unites' => 'integer',
        ];
    }

    // Appartient à une demande d'import
    public function demande()
    {
        return $this->belongsTo(DemandeImport::class, 'demande_id');
    }

    // Appartient à un type de conteneur
    public function typeConteneur()
    {
        return $this->belongsTo(TypeConteneur::class);
    }

    // Conteneur réel affecté par NASHCO
    public function conteneur()
    {
        return $this->belongsTo(Conteneur::class);
    }
}