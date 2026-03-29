<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class RestitutionCaution extends Model
{
    use HasFactory;

    protected $table = 'restitutions_caution';

    protected $fillable = [
        'contrat_id',
        'type_action',
        'montant',
        'devise',
        'montant_restitue',
        'montant_retenu',
        'motif_retenu',
        'date_action',
        'numero_cheque',
        'banque_id',
        'numero_cheque_restitution',
        'motif',
        'traite_par_user_id',
        'document_id',
    ];

    protected $casts = [
        'montant'           => 'decimal:2',
        'montant_restitue'  => 'decimal:2',
        'montant_retenu'    => 'decimal:2',
        'date_action'       => 'date',
    ];

    // -------------------------------------------------------------------------
    // Relations
    // -------------------------------------------------------------------------

    public function contrat()
    {
        return $this->belongsTo(ContratImport::class, 'contrat_id');
    }

    public function banque()
    {
        return $this->belongsTo(Banque::class, 'banque_id');
    }

    public function traitePar()
    {
        return $this->belongsTo(User::class, 'traite_par_user_id');
    }

    public function document()
    {
        return $this->belongsTo(Document::class, 'document_id');
    }

    // -------------------------------------------------------------------------
    // Scopes
    // -------------------------------------------------------------------------

    public function scopeDepots($query)
    {
        return $query->where('type_action', 'DEPOT');
    }

    public function scopeEncaissements($query)
    {
        return $query->where('type_action', 'ENCAISSEMENT');
    }

    public function scopeRestitutions($query)
    {
        return $query->whereIn('type_action', ['RESTITUTION', 'RESTITUTION_PARTIELLE']);
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    public function estRestitution(): bool
    {
        return in_array($this->type_action, ['RESTITUTION', 'RESTITUTION_PARTIELLE']);
    }

    public function estEncaissement(): bool
    {
        return $this->type_action === 'ENCAISSEMENT';
    }

    /**
     * Get the latest action on a contract's caution cheque.
     */
    public static function dernierEtat(int $contratId): ?static
    {
        return static::where('contrat_id', $contratId)
                     ->orderByDesc('date_action')
                     ->orderByDesc('id')
                     ->first();
    }
}