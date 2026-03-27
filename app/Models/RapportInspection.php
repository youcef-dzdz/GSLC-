<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RapportInspection extends Model
{
    use HasFactory;

    protected $table = 'rapports_inspection';

    protected $fillable = [
        'conteneur_id',
        'inspecteur_id',
        'contrat_id',
        'date_inspection',
        'etat_conteneur',
        'action_requise',
        'cout_reparation_estime',
        'observations',
        'photos',
    ];

    protected function casts(): array
    {
        return [
            'date_inspection'        => 'datetime',
            'cout_reparation_estime' => 'decimal:2',
            'photos'                 => 'array',
        ];
    }

    public function conteneur()
    {
        return $this->belongsTo(Conteneur::class);
    }

    public function inspecteur()
    {
        return $this->belongsTo(User::class, 'inspecteur_id');
    }

    public function contrat()
    {
        return $this->belongsTo(ContratImport::class, 'contrat_id');
    }

    public function necessiteReparation(): bool
    {
        return in_array($this->action_requise, ['REPARATION', 'MISE_AU_REBUT']);
    }
}