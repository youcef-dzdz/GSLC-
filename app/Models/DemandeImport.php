<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DemandeImport extends Model
{
    use HasFactory;

    protected $table = 'demandes_import';

    protected $fillable = [
        'client_id',
        'transitaire_id',
        'port_origine_id',
        'port_destination_id',
        'traite_par_user_id',
        'numero_dossier',
        'type_achat',
        'priorite',
        'date_soumission',
        'date_livraison_souhaitee',
        'statut',
        'nombre_negociations',
        'notes_client',
        'motif_rejet',
        'date_traitement',
    ];

    protected function casts(): array
    {
        return [
            'date_soumission'          => 'datetime',
            'date_livraison_souhaitee' => 'date',
            'date_traitement'          => 'datetime',
            'nombre_negociations'      => 'integer',
        ];
    }

    // Appartient à un client
    public function client()
    {
        return $this->belongsTo(Client::class);
    }

    // Appartient à un transitaire
    public function transitaire()
    {
        return $this->belongsTo(Transitaire::class);
    }

    // Port d'origine
    public function portOrigine()
    {
        return $this->belongsTo(Port::class, 'port_origine_id');
    }

    // Port de destination
    public function portDestination()
    {
        return $this->belongsTo(Port::class, 'port_destination_id');
    }

    // Traité par un employé NASHCO
    public function traitePar()
    {
        return $this->belongsTo(User::class, 'traite_par_user_id');
    }

    // Une demande a plusieurs lignes
    public function lignes()
    {
        return $this->hasMany(LigneDemande::class, 'demande_id');
    }

    // Une demande a plusieurs conteneurs demandés
    public function conteneurs()
    {
        return $this->hasMany(DemandeConteneur::class, 'demande_id');
    }

    // Une demande a plusieurs documents
    public function documents()
    {
        return $this->hasMany(Document::class, 'demande_id');
    }

    // Une demande a plusieurs devis
    public function devis()
    {
        return $this->hasMany(Devis::class, 'demande_id');
    }

    // Le devis actif (dernier en date)
    public function devisActif()
    {
        return $this->hasOne(Devis::class, 'demande_id')
                    ->orderBy('version', 'desc')
                    ->whereIn('statut', ['ENVOYE', 'EN_NEGOCIATION']);
    }

    // Une demande a un contrat
    public function contrat()
    {
        return $this->hasOne(ContratImport::class, 'demande_id');
    }

    // Vérifie si la négociation est encore possible
    public function peutNegocier(): bool
    {
        return $this->nombre_negociations < 3;
    }

    // Vérifie si la demande est active
    public function estActive(): bool
    {
        return in_array($this->statut, ['SOUMISE', 'EN_COURS', 'ACCEPTEE']);
    }
}