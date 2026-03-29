<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Avenant extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'contrat_id',
        'numero_avenant',
        'type_modification',
        'description',
        'modifications',
        'statut',
        'cree_par_user_id',
        'signature_ip',
        'signature_user_agent',
        'signature_otp_token',
        'signe_le',
        'motif_refus',
    ];

    protected $casts = [
        'modifications' => 'array',
        'signe_le'      => 'datetime',
    ];

    // -------------------------------------------------------------------------
    // Relations
    // -------------------------------------------------------------------------

    public function contrat()
    {
        return $this->belongsTo(ContratImport::class, 'contrat_id');
    }

    public function creePar()
    {
        return $this->belongsTo(User::class, 'cree_par_user_id');
    }

    // -------------------------------------------------------------------------
    // Scopes
    // -------------------------------------------------------------------------

    public function scopeSigne($query)
    {
        return $query->where('statut', 'SIGNE');
    }

    public function scopeEnAttente($query)
    {
        return $query->where('statut', 'EN_ATTENTE_SIGNATURE');
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    public function estSigne(): bool
    {
        return $this->statut === 'SIGNE';
    }

    public function estEnAttente(): bool
    {
        return $this->statut === 'EN_ATTENTE_SIGNATURE';
    }

    /**
     * Generate the next avenant number for a given contract.
     */
    public static function prochainNumero(int $contratId): int
    {
        return static::where('contrat_id', $contratId)->max('numero_avenant') + 1;
    }
}