<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Facture extends Model
{
    use HasFactory;

    protected $fillable = [
        'numero_facture',
        'client_id',
        'contrat_id',
        'devise_id',
        'cree_par_user_id',
        'type_facture',
        'date_emission',
        'date_echeance',
        'montant_ht',
        'tva',
        'montant_ttc',
        'montant_paye',
        'montant_restant',
        'statut',
        'conditions_paiement',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'date_emission'  => 'date',
            'date_echeance'  => 'date',
            'montant_ht'     => 'decimal:2',
            'tva'            => 'decimal:2',
            'montant_ttc'    => 'decimal:2',
            'montant_paye'   => 'decimal:2',
            'montant_restant'=> 'decimal:2',
        ];
    }

    public function client()
    {
        return $this->belongsTo(Client::class);
    }

    public function contrat()
    {
        return $this->belongsTo(ContratImport::class, 'contrat_id');
    }

    public function devise()
    {
        return $this->belongsTo(Devise::class);
    }

    public function creePar()
    {
        return $this->belongsTo(User::class, 'cree_par_user_id');
    }

    public function lignes()
    {
        return $this->hasMany(LigneFacture::class, 'facture_id');
    }

    public function paiements()
    {
        return $this->hasMany(Paiement::class, 'facture_id');
    }

    public function notifications()
    {
        return $this->hasMany(Notification::class, 'facture_id');
    }

    public function estPayee(): bool
    {
        return $this->statut === 'PAYEE';
    }

    public function estEnRetard(): bool
    {
        return $this->date_echeance->isPast() && !$this->estPayee();
    }

    public function montantRestantCalcule(): float
    {
        return $this->montant_ttc - $this->montant_paye;
    }
}