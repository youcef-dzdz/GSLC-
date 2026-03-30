<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Traits\Auditable;
use App\Models\ContratImport;
use App\Models\LigneContrat;
use App\Models\LigneDevis;
use App\Models\Devis;
use App\Models\ConfigurationSysteme;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class ContratImportController extends Controller
{
    use Auditable;

    // =========================================================================
    // INDEX
    // =========================================================================

    public function index(Request $request): JsonResponse
    {
        $query = ContratImport::with(['client', 'creePar'])
            ->orderByDesc('created_at');

        if ($request->filled('statut')) {
            $query->where('statut', $request->statut);
        }

        if ($request->filled('client_id')) {
            $query->where('client_id', $request->client_id);
        }

        $contrats = $query->paginate(20);

        $contrats->getCollection()->transform(fn($c) => [
            'id'             => $c->id,
            'numero_contrat' => $c->numero_contrat,
            'client'         => $c->client?->raison_sociale,
            'client_id'      => $c->client_id,
            'statut'         => $c->statut,
            'statut_caution' => $c->statut_caution,
            'date_debut'     => $c->date_debut,
            'date_fin'       => $c->date_fin,
            'montant_caution'=> (float) $c->montant_caution,
            'jours_restants' => $c->joursRestants(),
            'created_at'     => $c->created_at,
        ]);

        return response()->json($contrats);
    }

    // =========================================================================
    // SHOW
    // =========================================================================

    public function show(int $id): JsonResponse
    {
        $contrat = ContratImport::with([
            'client',
            'devis.lignes',
            'lignes.typeConteneur',
            'avenants',
            'restitutionsCaution',
            'factures',
            'rapportsInspection',
            'banque',
            'creePar',
            'conditionsGenerales',
        ])->findOrFail($id);

        return response()->json([
            'contrat'         => $contrat,
            'jours_restants'  => $contrat->joursRestants(),
            'est_expire'      => $contrat->estExpire(),
            'est_signe'       => $contrat->estSigneParClient(),
            'montant_facture' => $contrat->montantTotalFacture(),
            'solde_restant'   => $contrat->soldeRestant(),
        ]);
    }

    // =========================================================================
    // STORE — auto-called when client accepts a quote
    // =========================================================================

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'devis_id'               => 'required|exists:devis,id',
            'date_debut'             => 'required|date',
            'date_fin'               => 'required|date|after:date_debut',
            'montant_caution'        => 'required|numeric|min:0',
            'conditions_generales_id'=> 'nullable|exists:conditions_generales,id',
            'clauses_speciales'      => 'nullable|string',
        ]);

        $devis = Devis::with(['demande.client', 'lignes'])->findOrFail($request->devis_id);

        if ($devis->statut !== 'ACCEPTE') {
            return response()->json([
                'message' => 'Le devis doit être accepté avant de créer un contrat.',
            ], 422);
        }

        DB::beginTransaction();
        try {
            // Generate contract number: GSLC-YYYY-NNNN
            $year        = now()->year;
            $lastNumber  = ContratImport::whereYear('created_at', $year)->count() + 1;
            $numeroContrat = 'CTR-' . $year . '-' . str_pad($lastNumber, 4, '0', STR_PAD_LEFT);

            // Generate OTP
            $otp = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

            $contrat = ContratImport::create([
                'numero_contrat'          => $numeroContrat,
                'devis_id'                => $devis->id,
                'client_id'               => $devis->demande->client_id,
                'demande_id'              => $devis->demande_id,
                'cree_par_user_id'        => auth()->id(),
                'conditions_generales_id' => $request->conditions_generales_id,
                'date_debut'              => $request->date_debut,
                'date_fin'                => $request->date_fin,
                'statut'                  => 'EN_ATTENTE_SIGNATURE',
                'montant_caution'         => $request->montant_caution,
                'statut_caution'          => 'EN_ATTENTE',
                'token_signature'         => $otp,
                'clauses_speciales'       => $request->clauses_speciales,
                'conditions_acceptees'    => false,
            ]);

            // Copy lines from devis to contrat
            foreach ($devis->lignes as $ligneDevis) {
                LigneContrat::create([
                    'contrat_id'       => $contrat->id,
                    'tarif_service_id' => $ligneDevis->tarif_service_id,
                    'type_ligne'       => $ligneDevis->type_ligne,
                    'service'          => $ligneDevis->service,
                    'description'      => $ligneDevis->description,
                    'quantite'         => $ligneDevis->quantite,
                    'prix_unitaire'    => $ligneDevis->prix_unitaire,
                    'tva_applicable'   => $ligneDevis->tva_applicable,
                    'total_ht'         => $ligneDevis->total_ht,
                    'franchise_jours'  => 7, // default from config
                    'date_debut'       => $request->date_debut,
                    'date_fin'         => $request->date_fin,
                ]);
            }

            // Notify client with OTP
            Notification::create([
                'destinataire_id' => $devis->demande->client->user_id,
                'demande_id'      => $devis->demande_id,
                'titre'           => 'Contrat prêt à signer',
                'message'         => 'Votre contrat ' . $numeroContrat . ' est prêt. Votre code de signature OTP est : ' . $otp . '. Ce code expire dans 10 minutes.',
                'canal'           => 'SYSTEME',
                'lu'              => false,
                'date_creation'   => now(),
            ]);

            DB::commit();

            $this->audit('CREATE', 'contrats_import', $contrat->id, null, $contrat->toArray());

            return response()->json([
                'message' => 'Contrat généré. OTP envoyé au client pour signature.',
                'contrat' => $contrat->load('lignes'),
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Erreur : ' . $e->getMessage()], 500);
        }
    }

    // =========================================================================
    // ACTIVATE — after cheque verified, check threshold
    // =========================================================================

    public function activate(int $id): JsonResponse
    {
        $contrat = ContratImport::with('client')->findOrFail($id);

        if ($contrat->statut !== 'EN_ATTENTE_ACTIVATION') {
            return response()->json([
                'message' => 'Ce contrat ne peut pas être activé dans son état actuel.',
            ], 422);
        }

        $old       = $contrat->toArray();
        $threshold = (float) ConfigurationSysteme::getValeur('contract_approval_threshold', 5000000);

        // Check if director approval is needed
        if ((float) $contrat->montant_caution >= $threshold) {
            $contrat->update(['statut' => 'EN_ATTENTE_APPROBATION_DIRECTEUR']);

            // Notify directeur
            $directeurs = User::whereHas('role', fn($q) => $q->where('label', 'directeur'))->get();
            foreach ($directeurs as $directeur) {
                Notification::create([
                    'destinataire_id' => $directeur->id,
                    'titre'           => 'Contrat en attente d\'approbation',
                    'message'         => 'Le contrat ' . $contrat->numero_contrat . ' dépasse le seuil de ' . number_format($threshold, 0, ',', ' ') . ' DZD et nécessite votre approbation.',
                    'canal'           => 'SYSTEME',
                    'lu'              => false,
                    'date_creation'   => now(),
                ]);
            }

            $this->audit('UPDATE', 'contrats_import', $contrat->id, $old, ['statut' => 'EN_ATTENTE_APPROBATION_DIRECTEUR']);

            return response()->json([
                'message' => 'Contrat soumis au Directeur pour approbation (montant > ' . number_format($threshold, 0, ',', ' ') . ' DZD).',
                'contrat' => $contrat->fresh(),
            ]);
        }

        // Below threshold — activate directly
        $contrat->update(['statut' => 'ACTIF']);

        // Notify client
        Notification::create([
            'destinataire_id' => $contrat->client->user_id,
            'titre'           => 'Contrat activé',
            'message'         => 'Votre contrat ' . $contrat->numero_contrat . ' est maintenant actif. Bienvenue chez NASHCO.',
            'canal'           => 'SYSTEME',
            'lu'              => false,
            'date_creation'   => now(),
        ]);

        $this->audit('UPDATE', 'contrats_import', $contrat->id, $old, ['statut' => 'ACTIF']);

        return response()->json([
            'message' => 'Contrat activé avec succès.',
            'contrat' => $contrat->fresh(),
        ]);
    }
}
