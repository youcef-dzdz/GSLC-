<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Alerte extends Model
{
    use HasFactory;

    protected $fillable = [
        'type_alerte',
        'niveau',
        'entite_type',
        'entite_id',
        'message',
        'meta',
        'destinataire_user_id',
        'est_lue',
        'lue_le',
        'est_traitee',
        'traitee_par_user_id',
        'date_traitement',
        'note_traitement',
    ];

    protected $casts = [
        'meta'            => 'array',
        'est_lue'         => 'boolean',
        'est_traitee'     => 'boolean',
        'lue_le'          => 'datetime',
        'date_traitement' => 'datetime',
    ];

    // -------------------------------------------------------------------------
    // Relations
    // -------------------------------------------------------------------------

    public function destinataire()
    {
        return $this->belongsTo(User::class, 'destinataire_user_id');
    }

    public function traitePar()
    {
        return $this->belongsTo(User::class, 'traitee_par_user_id');
    }

    // -------------------------------------------------------------------------
    // Scopes
    // -------------------------------------------------------------------------

    public function scopeNonLues($query)
    {
        return $query->where('est_lue', false);
    }

    public function scopeNonTraitees($query)
    {
        return $query->where('est_traitee', false);
    }

    public function scopeCritiques($query)
    {
        return $query->where('niveau', 'CRITIQUE');
    }

    public function scopePourUser($query, int $userId)
    {
        return $query->where(function ($q) use ($userId) {
            $q->where('destinataire_user_id', $userId)
              ->orWhereNull('destinataire_user_id');
        });
    }

    public function scopeParEntite($query, string $type, int $id)
    {
        return $query->where('entite_type', $type)->where('entite_id', $id);
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    public function marquerLue(): void
    {
        $this->update([
            'est_lue' => true,
            'lue_le'  => now(),
        ]);
    }

    public function marquerTraitee(int $userId, string $note = null): void
    {
        $this->update([
            'est_traitee'          => true,
            'traitee_par_user_id'  => $userId,
            'date_traitement'      => now(),
            'note_traitement'      => $note,
        ]);
    }

    public function estCritique(): bool
    {
        return $this->niveau === 'CRITIQUE';
    }
}