<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Devis extends Model
{
    use HasFactory;

    protected $table = 'devis';

    protected $fillable = [
        'demande_id',
        'cree_par_user_id',
        'devis_precedent_id',
        'numero_devis',
        'version',
        'montant_ht',
        'tva',
        'total_ttc',
        'statut',
        'commentaire_client',
        'commentaire_nashco',
        'date_envoi',
        'date_expiration',
    ];

    protected function casts(): array
    {
        return [
            'montant_ht'      => 'decimal:2',
            'tva'             => 'decimal:2',
            'total_ttc'       => 'decimal:2',
            'version'         => 'integer',
            'date_envoi'      => 'datetime',
            'date_expiration' => 'date',
        ];
    }

    // Appartient à une demande
    public function demande()
    {
        return $this->belongsTo(DemandeImport::class, 'demande_id');
    }

    // Créé par un employé NASHCO
    public function creePar()
    {
        return $this->belongsTo(User::class, 'cree_par_user_id');
    }

    // Lien vers le devis précédent
    public function devisPrecedent()
    {
        return $this->belongsTo(Devis::class, 'devis_precedent_id');
    }

    // Devis suivant (après négociation)
    public function devisSuivant()
    {
        return $this->hasOne(Devis::class, 'devis_precedent_id');
    }

    // Un devis a plusieurs lignes
    public function lignes()
    {
        return $this->hasMany(LigneDevis::class, 'devis_id');
    }

    // Vérifie si le devis est expiré
    public function estExpire(): bool
    {
        if (!$this->date_expiration) return false;
        return $this->date_expiration->isPast();
    }

    // Vérifie si le devis peut être négocié
    public function peutEtreNegocie(): bool
    {
        return in_array($this->statut, ['ENVOYE', 'EN_NEGOCIATION'])
            && !$this->estExpire()
            && $this->demande->peutNegocier();
    }

    // Vérifie si le devis est accepté
    public function estAccepte(): bool
    {
        return $this->statut === 'ACCEPTE';
    }
}