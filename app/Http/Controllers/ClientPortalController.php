<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Traits\Auditable;
use App\Models\Client;
use App\Models\DemandeImport;
use App\Models\Devis;
use App\Models\ContratImport;
use App\Models\Facture;
use App\Models\Conteneur;
use App\Models\Notification;
use App\Models\ConfigurationSysteme;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class ClientPortalController extends Controller
{
    use Auditable;

    /**
     * Get the authenticated client profile.
     * Every method must scope data to this client only.
     */
    private function getClient(): Client
    {
        return Client::where('user_id', Auth::id())->firstOrFail();
    }

    // =========================================================================
    // DASHBOARD
    // =========================================================================

    public function dashboard(): JsonResponse
    {
        $client = $this->getClient();

        // Active containers with franchise bars
        $conteneurs = Conteneur::whereHas('mouvements', fn($q) => $q->where('client_id', $client->id))
            ->where('statut', 'LIVRE_CLIENT')
            ->with('typeConteneur')
            ->get()
            ->map(fn($c) => [
                'id'               => $c->id,
                'numero_conteneur' => $c->numero_conteneur,
                'type'             => $c->typeConteneur?->libelle,
                'statut'           => $c->statut,
            ]);

        // Unpaid invoices
        $facturesImpayees = Facture::where('client_id', $client->id)
            ->whereNotIn('statut', ['PAYEE', 'ANNULEE'])
            ->get();

        // Last 3 demands
        $derniersDemandes = DemandeImport::where('client_id', $client->id)
            ->orderByDesc('created_at')
            ->limit(3)
            ->get()
            ->map(fn($d) => [
                'id'             => $d->id,
                'numero_dossier' => $d->numero_dossier,
                'statut'         => $d->statut,
                'priorite'       => $d->priorite,
                'created_at'     => $d->created_at,
            ]);

        return response()->json([
            'conteneurs_actifs'   => $conteneurs->count(),
            'factures_impayees'   => [
                'count'  => $facturesImpayees->count(),
                'montant'=> (float) $facturesImpayees->sum('montant_restant'),
            ],
            'derniers_demandes'   => $derniersDemandes,
            'score_risque'        => $client->score_risque ?? 'FAIBLE',
        ]);
    }

    // =========================================================================
    // QUOTES
    // =========================================================================

    public function showQuote(int $id): JsonResponse
    {
        $client = $this->getClient();

        $devis = Devis::with(['demande', 'lignes'])
            ->whereHas('demande', fn($q) => $q->where('client_id', $client->id))
            ->findOrFail($id);

        return response()->json($devis);
    }

    public function acceptQuote(int $id): JsonResponse
    {
        $client = $this->getClient();

        $devis = Devis::whereHas('demande', fn($q) => $q->where('client_id', $client->id))
            ->findOrFail($id);

        if ($devis->statut !== 'ENVOYE') {
            return response()->json(['message' => 'Ce devis ne peut pas être accepté dans son état actuel.'], 422);
        }

        $old = $devis->toArray();
        $devis->update([
            'statut' => 'ACCEPTE',
        ]);

        // Notify commercial
        $demande = $devis->demande;
        $demande->update(['statut' => 'ACCEPTE']);

        Notification::create([
            'destinataire_id' => $demande->traite_par_user_id,
            'demande_id'      => $demande->id,
            'titre'           => 'Devis accepté par le client',
            'message'         => 'Le client ' . $client->raison_sociale . ' a accepté le devis ' . $devis->numero_devis . '. Veuillez générer le contrat.',
            'canal'           => 'SYSTEME',
            'lu'              => false,
            'date_creation'   => now(),
        ]);

        $this->audit('UPDATE', 'devis', $devis->id, $old, ['statut' => 'ACCEPTE']);

        return response()->json([
            'message' => 'Devis accepté. Le responsable commercial va générer votre contrat.',
            'devis'   => $devis->fresh(),
        ]);
    }

    public function rejectQuote(Request $request, int $id): JsonResponse
    {
        $request->validate(['raison' => 'required|string|max:500']);

        $client = $this->getClient();

        $devis = Devis::whereHas('demande', fn($q) => $q->where('client_id', $client->id))
            ->findOrFail($id);

        if ($devis->statut !== 'ENVOYE') {
            return response()->json(['message' => 'Ce devis ne peut pas être refusé dans son état actuel.'], 422);
        }

        $old = $devis->toArray();
        $devis->update([
            'statut'           => 'REFUSE',
            'commentaire_client' => $request->raison,
        ]);

        $this->audit('UPDATE', 'devis', $devis->id, $old, ['statut' => 'REFUSE']);

        return response()->json(['message' => 'Devis refusé.', 'devis' => $devis->fresh()]);
    }

    public function requestModification(Request $request, int $id): JsonResponse
    {
        $request->validate(['commentaire' => 'required|string|max:1000']);

        $client = $this->getClient();
        $maxRounds = (int) ConfigurationSysteme::getValeur('max_negotiation_rounds', 3);

        $devis = Devis::with('demande')
            ->whereHas('demande', fn($q) => $q->where('client_id', $client->id))
            ->findOrFail($id);

        if ($devis->demande->nombre_negociations >= $maxRounds) {
            return response()->json([
                'message' => "Nombre maximum de négociations atteint ({$maxRounds}). Vous devez accepter ou refuser ce devis.",
            ], 422);
        }

        $old = $devis->toArray();
        $devis->update([
            'statut'           => 'MODIFICATION_DEMANDEE',
            'commentaire_client' => $request->commentaire,
        ]);

        // Notify commercial
        Notification::create([
            'destinataire_id' => $devis->demande->traite_par_user_id,
            'demande_id'      => $devis->demande_id,
            'titre'           => 'Modification demandée sur devis',
            'message'         => $client->raison_sociale . ' a demandé une modification sur le devis ' . $devis->numero_devis . ' : ' . $request->commentaire,
            'canal'           => 'SYSTEME',
            'lu'              => false,
            'date_creation'   => now(),
        ]);

        $this->audit('UPDATE', 'devis', $devis->id, $old, ['statut' => 'MODIFICATION_DEMANDEE']);

        return response()->json(['message' => 'Demande de modification envoyée au commercial.']);
    }

    // =========================================================================
    // CONTRACTS
    // =========================================================================

    public function contracts(): JsonResponse
    {
        $client = $this->getClient();

        $contrats = ContratImport::where('client_id', $client->id)
            ->with('lignes')
            ->orderByDesc('created_at')
            ->paginate(10);

        return response()->json($contrats);
    }

    public function showSignature(int $id): JsonResponse
    {
        $client  = $this->getClient();
        $contrat = ContratImport::with(['lignes', 'conditionsGenerales'])
            ->where('client_id', $client->id)
            ->where('statut', 'EN_ATTENTE_SIGNATURE')
            ->findOrFail($id);

        return response()->json($contrat);
    }

    public function submitSignature(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'otp'                    => 'required|string|size:6',
            'conditions_acceptees'   => 'required|boolean|accepted',
        ]);

        $client  = $this->getClient();
        $contrat = ContratImport::where('client_id', $client->id)
            ->where('statut', 'EN_ATTENTE_SIGNATURE')
            ->findOrFail($id);

        // Validate OTP
        if ($request->otp !== $contrat->token_signature) {
            return response()->json(['message' => 'Code OTP incorrect.'], 422);
        }

        $old = $contrat->toArray();
        $contrat->update([
            'statut'                     => 'EN_ATTENTE_CAUTION',
            'date_signature'             => now(),
            'ip_signature'               => $request->ip(),
            'user_agent_signature'       => $request->userAgent(),
            'conditions_acceptees'       => true,
            'date_acceptation_conditions'=> now(),
            'ip_acceptation_conditions'  => $request->ip(),
        ]);

        $this->audit('UPDATE', 'contrats_import', $contrat->id, $old, ['statut' => 'EN_ATTENTE_CAUTION']);

        return response()->json([
            'message' => 'Contrat signé avec succès. Veuillez déposer votre chèque de caution au bureau NASHCO.',
            'contrat' => $contrat->fresh(),
        ]);
    }

    // =========================================================================
    // INVOICES
    // =========================================================================

    public function invoices(): JsonResponse
    {
        $client   = $this->getClient();
        $factures = Facture::where('client_id', $client->id)
            ->orderByDesc('date_emission')
            ->paginate(10);

        return response()->json($factures);
    }

    public function downloadInvoice(int $id): JsonResponse
    {
        $client  = $this->getClient();
        $facture = Facture::where('client_id', $client->id)->findOrFail($id);

        // PDF generation would go here with DomPDF
        // For now return the invoice data
        return response()->json([
            'message' => 'PDF disponible.',
            'facture' => $facture->load('lignes'),
        ]);
    }

    // =========================================================================
    // CONTAINERS
    // =========================================================================

    public function containers(): JsonResponse
    {
        $client = $this->getClient();

        $conteneurs = Conteneur::whereHas('mouvements', fn($q) => $q->where('client_id', $client->id))
            ->with(['typeConteneur', 'mouvements' => fn($q) => $q->orderByDesc('date_mouvement')->limit(1)])
            ->paginate(20);

        return response()->json($conteneurs);
    }
}
