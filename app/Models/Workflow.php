<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Workflow extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'nom_processus',
        'type_workflow',
        'description',
        'actif',
    ];

    protected function casts(): array
    {
        return [
            'actif' => 'boolean',
        ];
    }

    // Un workflow a plusieurs étapes
    public function etapes()
    {
        return $this->hasMany(EtapeWorkflow::class);
    }

    // Un workflow a plusieurs instances
    public function instances()
    {
        return $this->hasMany(InstanceWorkflow::class);
    }
}