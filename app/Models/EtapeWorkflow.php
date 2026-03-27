<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EtapeWorkflow extends Model
{
    use HasFactory;

    protected $table = 'etapes_workflow';

    protected $fillable = [
        'workflow_id',
        'nom_etape',
        'ordre',
        'role_responsable',
        'description',
        'delai_heures',
        'est_optionnelle',
    ];

    protected function casts(): array
    {
        return [
            'ordre'          => 'integer',
            'delai_heures'   => 'integer',
            'est_optionnelle'=> 'boolean',
        ];
    }

    // Appartient à un workflow
    public function workflow()
    {
        return $this->belongsTo(Workflow::class);
    }

    // Une étape a plusieurs instances
    public function instancesWorkflow()
    {
        return $this->hasMany(InstanceWorkflow::class);
    }
}