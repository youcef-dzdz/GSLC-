<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CalculPenalite extends Model
{
    use HasFactory;

    protected $table = 'calcul_penalites';

    protected $fillable = [
        'conteneur_id',
        'contrat_id',
        'penalite_id',
        'franchise_id',
        'cree_par_user_id',
        'type_penalite',
        'date_debut',
        'date_fin',
        'jours_franchise_appliques',
        'jours_retard',
        'tarif_applique',
        'montant_ht',
        'tva',
        'montant_ttc',
        'statut',
    ];

    protected function casts(): array
    {
        return [
            'date_debut'               => 'date',
            'date_fin'                 => 'date',
            'jours_franchise_appliques'=> 'integer',
            'jours_retard'             => 'integer',
            'tarif_applique'           => 'decimal:2',
            'montant_ht'               => 'decimal:2',
            'tva'                      => 'decimal:2',
            'montant_ttc'              => 'decimal:2',
        ];
    }

    public function conteneur()
    {
        return $this->belongsTo(Conteneur::class);
    }

    public function contrat()
    {
        return $this->belongsTo(ContratImport::class, 'contrat_id');
    }

    public function penalite()
    {
        return $this->belongsTo(Penalite::class);
    }

    public function franchise()
    {
        return $this->belongsTo(Franchise::class);
    }

    public function creePar()
    {
        return $this->belongsTo(User::class, 'cree_par_user_id');
    }

    public function lignesFacture()
    {
        return $this->hasMany(LigneFacture::class, 'calcul_penalite_id');
    }
}