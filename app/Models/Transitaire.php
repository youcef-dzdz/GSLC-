<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Transitaire extends Model
{
    use HasFactory;

    protected $fillable = [
        'nom_societe',
        'numero_rc',
        'numero_agrement',
        'date_expiration_agrement',
        'pays_id',
        'adresse_societe',
        'tel_societe',
        'email_societe',
        'site_web',
        'rep_nom',
        'rep_prenom',
        'rep_role_societe',
        'rep_tel_perso',
        'rep_email_perso',
        'statut',
        'valide_par_user_id',
        'date_validation',
        'motif_rejet',
        'actif',
    ];

    protected function casts(): array
    {
        return [
            'date_expiration_agrement' => 'date',
            'date_validation'          => 'datetime',
            'actif'                    => 'boolean',
        ];
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

    // Un transitaire apparait dans plusieurs demandes
    public function demandesImport()
    {
        return $this->hasMany(DemandeImport::class);
    }

    // Vérifie si l'agrément est expiré
    public function agrémentExpire(): bool
    {
        if (!$this->date_expiration_agrement) return false;
        return $this->date_expiration_agrement->isPast();
    }

    // Vérifie si le transitaire est utilisable
    public function estUtilisable(): bool
    {
        return $this->statut === 'APPROUVE' 
            && $this->actif 
            && !$this->agrémentExpire();
    }
}