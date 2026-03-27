<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class JournalAudit extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'utilisateur_id',
        'action',
        'table_cible',
        'enregistrement_id',
        'anciennes_valeurs',
        'nouvelles_valeurs',
        'adresse_ip',
        'user_agent',
        'resultat',
        'date_action',
    ];

    protected function casts(): array
    {
        return [
            'anciennes_valeurs' => 'array',
            'nouvelles_valeurs' => 'array',
            'date_action'       => 'datetime',
        ];
    }

    // Appartient à un utilisateur
    public function utilisateur()
    {
        return $this->belongsTo(User::class, 'utilisateur_id');
    }
}