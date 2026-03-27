<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Client extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'raison_sociale',
        'nif',
        'nis',
        'rc',
        'adresse_siege',
        'ville',
        'pays_id',
        'type_client',
        'rep_nom',
        'rep_prenom',
        'rep_role',
        'rep_tel',
        'rep_email',
        'rep_adresse_perso',
        'statut',
        'valide_par_user_id',
        'date_validation',
        'motif_rejet',
    ];

    protected function casts(): array
    {
        return [
            'date_validation' => 'datetime',
        ];
    }

    // Appartient à un user
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Appartient à un pays
    public function pays()
    {
        return $this->belongsTo(Pays::class);
    }

    // Validé par un employé NASHCO
    public function validePar()
    {
        return $this->belongsTo(User::class, 'valide_par_user_id');
    }

    // Un client a plusieurs demandes
    public function demandes()
    {
        return $this->hasMany(DemandeImport::class);
    }

    // Un client a plusieurs contrats
    public function contrats()
    {
        return $this->hasMany(ContratImport::class);
    }

    // Un client a plusieurs factures
    public function factures()
    {
        return $this->hasMany(Facture::class);
    }

    // Un client a plusieurs mouvements conteneurs
    public function mouvementsConteneurs()
    {
        return $this->hasMany(MouvementConteneur::class);
    }

    // Vérifie si le client peut soumettre des demandes
    public function estActif(): bool
    {
        return $this->statut === 'APPROUVE';
    }
}