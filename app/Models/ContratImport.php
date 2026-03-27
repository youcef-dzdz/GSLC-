<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ContratImport extends Model
{
    use HasFactory;

    protected $table = 'contrats_import';

    protected $fillable = [
        'numero_contrat',
        'devis_id',
        'client_id',
        'demande_id',
        'cree_par_user_id',
        'conditions_generales_id',
        'date_debut',
        'date_fin',
        'statut',
        'clauses_renouvellement',
        'clauses_resiliation',
        'clauses_speciales',
        'type_signature',
        'date_signature',
        'ip_signature',
        'user_agent_signature',
        'token_signature',
        'conditions_acceptees',
        'date_acceptation_conditions',
        'ip_acceptation_conditions',
        'montant_caution',
        'statut_caution',
        'numero_cheque',
        'banque_id',
        'montant_cheque',
        'date_cheque',
        'est_certifie',
        'date_depot_cheque',
        'date_limite_depot',
        'recu_par_user_id',
        'date_verification_caution',
        'verifie_caution_par_user_id',
        'date_restitution_cheque',
        'date_encaissement_cheque',
        'motif_encaissement',
    ];

    protected function casts(): array
    {
        return [
            'date_debut'                    => 'date',
            'date_fin'                      => 'date',
            'date_signature'                => 'datetime',
            'date_acceptation_conditions'   => 'datetime',
            'date_verification_caution'     => 'datetime',
            'date_cheque'                   => 'date',
            'date_depot_cheque'             => 'date',
            'date_limite_depot'             => 'date',
            'date_restitution_cheque'       => 'date',
            'date_encaissement_cheque'      => 'date',
            'montant_caution'               => 'decimal:2',
            'montant_cheque'                => 'decimal:2',
            'conditions_acceptees'          => 'boolean',
            'est_certifie'                  => 'boolean',
        ];
    }

    // Relations
    public function devis()
    {
        return $this->belongsTo(Devis::class);
    }

    public function client()
    {
        return $this->belongsTo(Client::class);
    }

    public function demande()
    {
        return $this->belongsTo(DemandeImport::class, 'demande_id');
    }

    public function creePar()
    {
        return $this->belongsTo(User::class, 'cree_par_user_id');
    }

    public function conditionsGenerales()
    {
        return $this->belongsTo(ConditionsGenerales::class);
    }

    public function banque()
    {
        return $this->belongsTo(Banque::class);
    }

    public function recuPar()
    {
        return $this->belongsTo(User::class, 'recu_par_user_id');
    }

    public function verifieCautionPar()
    {
        return $this->belongsTo(User::class, 'verifie_caution_par_user_id');
    }

    public function lignes()
    {
        return $this->hasMany(LigneContrat::class, 'contrat_id');
    }

    public function factures()
    {
        return $this->hasMany(Facture::class, 'contrat_id');
    }

    public function rapportsInspection()
    {
        return $this->hasMany(RapportInspection::class, 'contrat_id');
    }

    public function calculPenalites()
    {
        return $this->hasMany(CalculPenalite::class, 'contrat_id');
    }

    // Vérifie si le contrat est actif
    public function estActif(): bool
    {
        return $this->statut === 'ACTIF';
    }

    // Vérifie si la caution est en attente
    public function cautionEnAttente(): bool
    {
        return $this->statut_caution === 'EN_ATTENTE';
    }

    // Calcule les jours restants
    public function joursRestants(): int
    {
        if (!$this->date_fin) return 0;
        return now()->diffInDays($this->date_fin, false);
    }
}