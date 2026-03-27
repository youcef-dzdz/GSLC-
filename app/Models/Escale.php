<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Escale extends Model
{
    use HasFactory;

    protected $fillable = [
        'navire_id',
        'port_id',
        'terminal_id',
        'responsable_id',
        'numero_escale',
        'date_arrivee_prevue',
        'date_depart_prevue',
        'date_arrivee_reelle',
        'date_depart_reelle',
        'quai',
        'nombre_conteneurs_prevus',
        'statut_escale',
        'observations',
    ];

    protected function casts(): array
    {
        return [
            'date_arrivee_prevue'      => 'datetime',
            'date_depart_prevue'       => 'datetime',
            'date_arrivee_reelle'      => 'datetime',
            'date_depart_reelle'       => 'datetime',
            'nombre_conteneurs_prevus' => 'integer',
        ];
    }

    // Appartient à un navire
    public function navire()
    {
        return $this->belongsTo(Navire::class);
    }

    // Appartient à un port
    public function port()
    {
        return $this->belongsTo(Port::class);
    }

    // Appartient à un terminal
    public function terminal()
    {
        return $this->belongsTo(Terminal::class);
    }

    // Géré par un employé NASHCO
    public function responsable()
    {
        return $this->belongsTo(User::class, 'responsable_id');
    }

    // Une escale a plusieurs conteneurs
    public function conteneurs()
    {
        return $this->hasMany(Conteneur::class);
    }

    // Calcule le retard en heures
    public function retardArriveeHeures(): int
    {
        if (!$this->date_arrivee_reelle) return 0;
        return $this->date_arrivee_prevue->diffInHours($this->date_arrivee_reelle);
    }

    // Vérifie si l'escale est en retard
    public function estEnRetard(): bool
    {
        return $this->retardArriveeHeures() > 0;
    }
}