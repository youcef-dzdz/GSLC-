<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Paiement extends Model
{
    use HasFactory;

    protected $fillable = [
        'facture_id',
        'banque_id',
        'recu_par_user_id',
        'montant',
        'date_paiement',
        'methode',
        'reference',
        'statut',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'montant'        => 'decimal:2',
            'date_paiement'  => 'date',
        ];
    }

    public function facture()
    {
        return $this->belongsTo(Facture::class);
    }

    public function banque()
    {
        return $this->belongsTo(Banque::class);
    }

    public function recuPar()
    {
        return $this->belongsTo(User::class, 'recu_par_user_id');
    }

    public function estConfirme(): bool
    {
        return $this->statut === 'CONFIRME';
    }
}