<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DemandeDocument extends Model
{
    use HasFactory;

    protected $table = 'demande_documents';

    protected $fillable = [
        'demande_id',
        'document_id',
        'verifie_par_user_id',
        'est_verifie',
        'date_verification',
        'commentaire',
    ];

    protected function casts(): array
    {
        return [
            'est_verifie'       => 'boolean',
            'date_verification' => 'datetime',
        ];
    }

    // Appartient à une demande
    public function demande()
    {
        return $this->belongsTo(DemandeImport::class, 'demande_id');
    }

    // Appartient à un document
    public function document()
    {
        return $this->belongsTo(Document::class);
    }

    // Vérifié par un employé NASHCO
    public function verifiePar()
    {
        return $this->belongsTo(User::class, 'verifie_par_user_id');
    }
}