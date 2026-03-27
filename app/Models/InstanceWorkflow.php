<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InstanceWorkflow extends Model
{
    use HasFactory;

    protected $table = 'instance_workflows';

    protected $fillable = [
        'workflow_id',
        'conteneur_id',
        'demande_id',
        'bloque_par_user_id',
        'etape_actuelle',
        'date_debut',
        'date_fin_prevue',
        'date_fin_reelle',
        'progression',
        'statut',
        'motif_blocage',
    ];

    protected function casts(): array
    {
        return [
            'etape_actuelle' => 'integer',
            'date_debut'     => 'date',
            'date_fin_prevue'=> 'date',
            'date_fin_reelle'=> 'date',
            'progression'    => 'decimal:2',
        ];
    }

    public function workflow()
    {
        return $this->belongsTo(Workflow::class);
    }

    public function conteneur()
    {
        return $this->belongsTo(Conteneur::class);
    }

    public function demande()
    {
        return $this->belongsTo(DemandeImport::class, 'demande_id');
    }

    public function bloquePar()
    {
        return $this->belongsTo(User::class, 'bloque_par_user_id');
    }

    public function estTermine(): bool
    {
        return $this->statut === 'TERMINE';
    }

    public function estBloque(): bool
    {
        return $this->statut === 'BLOQUE';
    }
}