<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Document extends Model
{
    use HasFactory;

    protected $fillable = [
        'client_id',
        'demande_id',
        'nom_original',
        'nom_stockage',
        'type_document',
        'extension',
        'chemin_stockage',
        'taille',
        'statut',
        'valide_par_user_id',
        'date_validation',
        'motif_rejet',
        'date_expiration',
    ];

    protected function casts(): array
    {
        return [
            'taille'          => 'integer',
            'date_validation' => 'datetime',
            'date_expiration' => 'date',
        ];
    }

    // Appartient à un client
    public function client()
    {
        return $this->belongsTo(Client::class);
    }

    // Appartient à une demande (optionnel)
    public function demande()
    {
        return $this->belongsTo(DemandeImport::class, 'demande_id');
    }

    // Validé par un employé NASHCO
    public function validePar()
    {
        return $this->belongsTo(User::class, 'valide_par_user_id');
    }

    // Taille formatée lisible
    public function tailleFormatee(): string
    {
        if (!$this->taille) return 'N/A';
        $units = ['B', 'KB', 'MB', 'GB'];
        $i = 0;
        $taille = $this->taille;
        while ($taille >= 1024 && $i < count($units) - 1) {
            $taille /= 1024;
            $i++;
        }
        return round($taille, 2) . ' ' . $units[$i];
    }

    // Vérifie si le document est expiré
    public function estExpire(): bool
    {
        if (!$this->date_expiration) return false;
        return $this->date_expiration->isPast();
    }

    // Vérifie si le document est valide et non expiré
    public function estValide(): bool
    {
        return $this->statut === 'VALIDE' && !$this->estExpire();
    }
}