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

    // =========================================================================
    // Relations — parents (belongsTo)
    // =========================================================================

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

    // =========================================================================
    // Relations — children (hasMany / hasOne)
    // =========================================================================

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

    // --- NEW ---

    public function avenants()
    {
        return $this->hasMany(Avenant::class, 'contrat_id')
                    ->orderBy('numero_avenant');
    }

    public function restitutionsCaution()
    {
        return $this->hasMany(RestitutionCaution::class, 'contrat_id')
                    ->orderBy('date_action');
    }

    /**
     * Quick access to the most recent cheque action —
     * useful for showing the current caution status on any dashboard card.
     */
    public function dernierEtatCaution()
    {
        return $this->hasOne(RestitutionCaution::class, 'contrat_id')
                    ->latestOfMany('date_action');
    }

    /**
     * Alerts linked to this contract via the polymorphic entite_type pattern.
     * Usage: $contrat->alertes
     */
    public function alertes()
    {
        return $this->hasMany(Alerte::class, 'entite_id')
                    ->where('entite_type', 'contrat');
    }

    // =========================================================================
    // Scopes
    // =========================================================================

    public function scopeActifs($query)
    {
        return $query->where('statut', 'ACTIF');
    }

    public function scopeEnAttenteSignature($query)
    {
        return $query->where('statut', 'EN_ATTENTE_SIGNATURE');
    }

    public function scopeEnAttenteCaution($query)
    {
        return $query->where('statut_caution', 'EN_ATTENTE');
    }

    public function scopeExpirantDans($query, int $jours)
    {
        return $query->where('statut', 'ACTIF')
                     ->whereBetween('date_fin', [now(), now()->addDays($jours)]);
    }

    // =========================================================================
    // Helpers
    // =========================================================================

    public function estActif(): bool
    {
        return $this->statut === 'ACTIF';
    }

    public function cautionEnAttente(): bool
    {
        return $this->statut_caution === 'EN_ATTENTE';
    }

    /**
     * Returns the number of days remaining before the contract ends.
     * Negative value means the contract is already expired.
     */
    public function joursRestants(): int
    {
        if (! $this->date_fin) return 0;
        return (int) now()->diffInDays($this->date_fin, false);
    }

    public function estExpire(): bool
    {
        return $this->date_fin && now()->isAfter($this->date_fin);
    }

    public function estSigneParClient(): bool
    {
        return ! is_null($this->date_signature) && ! is_null($this->token_signature);
    }

    /**
     * Total invoiced amount across all factures linked to this contract.
     */
    public function montantTotalFacture(): float
    {
        return (float) $this->factures()->sum('montant_ttc');
    }

    /**
     * Total remaining balance across all unpaid factures.
     */
    public function soldeRestant(): float
    {
        return (float) $this->factures()->sum('montant_restant');
    }
}