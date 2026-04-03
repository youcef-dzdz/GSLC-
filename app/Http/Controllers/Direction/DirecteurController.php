<?php

namespace App\Http\Controllers\Direction;

use App\Http\Controllers\Controller;

use App\Http\Controllers\Traits\Auditable;
use App\Models\ContratImport;
use App\Models\Facture;
use App\Models\Client;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class DirecteurController extends Controller
{
    use Auditable;

    // =========================================================================
    // DASHBOARD
    // =========================================================================

    public function dashboard(): JsonResponse
    {
        // Revenue this month vs last month
        $revenueThisMonth = Facture::where('statut', 'PAYEE')
            ->whereMonth('date_emission', now()->month)
            ->whereYear('date_emission', now()->year)
            ->sum('montant_ttc');

        $revenueLastMonth = Facture::where('statut', 'PAYEE')
            ->whereMonth('date_emission', now()->subMonth()->month)
            ->whereYear('date_emission', now()->subMonth()->year)
            ->sum('montant_ttc');

        // Active contracts count
        $contratsActifs = ContratImport::where('statut', 'ACTIF')->count();

        // Pending director approvals
        $pendingApprovals = ContratImport::where('statut', 'EN_ATTENTE_APPROBATION_DIRECTEUR')->count();

        // Risk score distribution
        $riskDistribution = Client::where('statut', 'VALIDE')
            ->select('score_risque', DB::raw('count(*) as total'))
            ->groupBy('score_risque')
            ->pluck('total', 'score_risque');

        // Top 5 at-risk clients (CRITIQUE first, then ELEVE)
        $topRiskClients = Client::with('user')
            ->where('statut', 'VALIDE')
            ->whereIn('score_risque', ['CRITIQUE', 'ELEVE'])
            ->orderByRaw("CASE score_risque WHEN 'CRITIQUE' THEN 1 WHEN 'ELEVE' THEN 2 ELSE 3 END")
            ->limit(5)
            ->get()
            ->map(fn($client) => [
                'id'            => $client->id,
                'raison_sociale'=> $client->raison_sociale,
                'score_risque'  => $client->score_risque,
                'ville'         => $client->ville,
            ]);

        return response()->json([
            'revenue' => [
                'ce_mois'      => (float) $revenueThisMonth,
                'mois_dernier' => (float) $revenueLastMonth,
                'evolution'    => $revenueLastMonth > 0
                    ? round((($revenueThisMonth - $revenueLastMonth) / $revenueLastMonth) * 100, 1)
                    : 0,
            ],
            'contrats_actifs'   => $contratsActifs,
            'pending_approvals' => $pendingApprovals,
            'risk_distribution' => [
                'FAIBLE'   => (int) ($riskDistribution['FAIBLE']   ?? 0),
                'MODERE'   => (int) ($riskDistribution['MODERE']   ?? 0),
                'ELEVE'    => (int) ($riskDistribution['ELEVE']    ?? 0),
                'CRITIQUE' => (int) ($riskDistribution['CRITIQUE'] ?? 0),
            ],
            'top_risk_clients'  => $topRiskClients,
        ]);
    }

    // =========================================================================
    // REPORTS
    // =========================================================================

    public function reports(): JsonResponse
    {
        // Summary stats for reports page
        $stats = [
            'factures_emises_ce_mois'  => Facture::whereMonth('date_emission', now()->month)->count(),
            'montant_facture_ce_mois'  => (float) Facture::whereMonth('date_emission', now()->month)->sum('montant_ttc'),
            'montant_recouvre_ce_mois' => (float) Facture::whereMonth('date_emission', now()->month)->sum('montant_paye'),
            'contrats_signes_ce_mois'  => ContratImport::whereMonth('created_at', now()->month)
                                            ->whereNotNull('date_signature')->count(),
            'clients_actifs_total'     => Client::where('statut', 'VALIDE')->count(),
        ];

        return response()->json(['stats' => $stats]);
    }

    // =========================================================================
    // PENDING CONTRACTS (> 5M DZD)
    // =========================================================================

    public function pendingContracts(): JsonResponse
    {
        $contracts = ContratImport::with(['client', 'devis', 'creePar'])
            ->where('statut', 'EN_ATTENTE_APPROBATION_DIRECTEUR')
            ->orderByDesc('created_at')
            ->paginate(20);

        $contracts->getCollection()->transform(fn($c) => [
            'id'             => $c->id,
            'numero_contrat' => $c->numero_contrat,
            'client'         => $c->client?->raison_sociale,
            'montant_caution'=> (float) $c->montant_caution,
            'date_debut'     => $c->date_debut,
            'date_fin'       => $c->date_fin,
            'cree_par'       => $c->creePar?->prenom . ' ' . $c->creePar?->nom,
            'created_at'     => $c->created_at,
        ]);

        return response()->json($contracts);
    }

    // =========================================================================
    // APPROVE CONTRACT
    // =========================================================================

    public function approveContract(Request $request, int $id): JsonResponse
    {
        $contrat = ContratImport::with(['client', 'creePar'])->findOrFail($id);

        if ($contrat->statut !== 'EN_ATTENTE_APPROBATION_DIRECTEUR') {
            return response()->json([
                'message' => 'Ce contrat n\'est pas en attente d\'approbation.',
            ], 422);
        }

        $old = $contrat->toArray();
        $contrat->update(['statut' => 'ACTIF']);

        // Notify the commercial who created the contract
        Notification::create([
            'destinataire_id' => $contrat->cree_par_user_id,
            'demande_id'      => $contrat->demande_id,
            'titre'           => 'Contrat approuvé par le Directeur',
            'message'         => 'Le contrat ' . $contrat->numero_contrat . ' a été approuvé par la direction et est maintenant ACTIF.',
            'canal'           => 'SYSTEME',
            'lu'              => false,
            'date_creation'   => now(),
        ]);

        $this->audit('UPDATE', 'contrats_import', $contrat->id, $old, ['statut' => 'ACTIF']);

        return response()->json([
            'message' => 'Contrat approuvé et activé avec succès.',
            'contrat' => $contrat->fresh(),
        ]);
    }

    // =========================================================================
    // RETURN CONTRACT (ask commercial to revise)
    // =========================================================================

    public function returnContract(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'raison' => 'required|string|max:500',
        ]);

        $contrat = ContratImport::with('creePar')->findOrFail($id);

        if ($contrat->statut !== 'EN_ATTENTE_APPROBATION_DIRECTEUR') {
            return response()->json([
                'message' => 'Ce contrat n\'est pas en attente d\'approbation.',
            ], 422);
        }

        $old = $contrat->toArray();
        $contrat->update(['statut' => 'RETOURNE']);

        // Notify commercial
        Notification::create([
            'destinataire_id' => $contrat->cree_par_user_id,
            'demande_id'      => $contrat->demande_id,
            'titre'           => 'Contrat retourné par le Directeur',
            'message'         => 'Le contrat ' . $contrat->numero_contrat . ' a été retourné. Raison : ' . $request->raison,
            'canal'           => 'SYSTEME',
            'lu'              => false,
            'date_creation'   => now(),
        ]);

        $this->audit('UPDATE', 'contrats_import', $contrat->id, $old, [
            'statut' => 'RETOURNE',
            'raison' => $request->raison,
        ]);

        return response()->json([
            'message' => 'Contrat retourné au responsable commercial.',
            'contrat' => $contrat->fresh(),
        ]);
    }
}
