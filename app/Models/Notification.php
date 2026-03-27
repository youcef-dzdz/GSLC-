<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    use HasFactory;

    protected $fillable = [
        'type_notification_id',
        'destinataire_id',
        'conteneur_id',
        'facture_id',
        'demande_id',
        'titre',
        'message',
        'canal',
        'lien_action',
        'date_creation',
        'date_envoi',
        'lu',
        'lu_le',
    ];

    protected function casts(): array
    {
        return [
            'date_creation' => 'datetime',
            'date_envoi'    => 'datetime',
            'lu'            => 'boolean',
            'lu_le'         => 'datetime',
        ];
    }

    public function typeNotification()
    {
        return $this->belongsTo(TypeNotification::class);
    }

    public function destinataire()
    {
        return $this->belongsTo(User::class, 'destinataire_id');
    }

    public function conteneur()
    {
        return $this->belongsTo(Conteneur::class);
    }

    public function facture()
    {
        return $this->belongsTo(Facture::class);
    }

    public function demande()
    {
        return $this->belongsTo(DemandeImport::class, 'demande_id');
    }

    public function marquerLu(): void
    {
        $this->update([
            'lu'    => true,
            'lu_le' => now(),
        ]);
    }
}