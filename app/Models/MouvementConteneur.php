<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MouvementConteneur extends Model
{
    use HasFactory;

    protected $table = 'mouvement_conteneurs';

    protected $fillable = [
        'conteneur_id',
        'client_id',
        'port_id',
        'depot_id',
        'emplacement_id',
        'responsable_id',
        'type_mouvement',
        'date_mouvement',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'date_mouvement' => 'datetime',
        ];
    }

    // Appartient à un conteneur
    public function conteneur()
    {
        return $this->belongsTo(Conteneur::class);
    }

    // Appartient à un client
    public function client()
    {
        return $this->belongsTo(Client::class);
    }

    // Appartient à un port
    public function port()
    {
        return $this->belongsTo(Port::class);
    }

    // Appartient à un dépôt
    public function depot()
    {
        return $this->belongsTo(Depot::class);
    }

    // Appartient à un emplacement
    public function emplacement()
    {
        return $this->belongsTo(Emplacement::class);
    }

    // Enregistré par un employé NASHCO
    public function responsable()
    {
        return $this->belongsTo(User::class, 'responsable_id');
    }
}