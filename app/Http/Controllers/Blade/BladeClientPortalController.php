<?php

namespace App\Http\Controllers\Blade;

use App\Http\Controllers\Controller;
use App\Models\Client;
use App\Models\Conteneur;
use App\Models\ContratImport;
use App\Models\DemandeImport;
use App\Models\Devis;
use App\Models\Facture;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class BladeClientPortalController extends Controller
{
    private function getClient()
    {
        return Client::where('user_id', auth()->id())->firstOrFail();
    }

    public function dashboard()
    {
        $client = $this->getClient();
        $stats  = [
            'demandes'  => $client->demandes()->count(),
            'contrats'  => $client->contrats()->where('statut', 'ACTIF')->count(),
            'factures'  => $client->factures()->whereNotIn('statut', ['PAYEE', 'ANNULEE'])->count(),
            'solde_du'  => $client->factures()->sum('montant_restant'),
        ];
        $recentDemands = $client->demandes()->latest()->limit(5)->get();
        return view('blade.client.dashboard', compact('client', 'stats', 'recentDemands'));
    }

    public function demands()
    {
        $client  = $this->getClient();
        $search  = request('search');
        $statut  = request('statut');

        $query = $client->demandes()->orderByDesc('date_soumission');

        if ($search) $query->where('numero_dossier', 'ilike', "%{$search}%");
        if ($statut) $query->where('statut', $statut);

        $demands = $query->paginate(20)->withQueryString();
        return view('blade.client.demands', compact('demands', 'search'));
    }

    public function createDemand()
    {
        return view('blade.client.demands_create');
    }

    public function storeDemand(Request $request)
    {
        $request->validate([
            'type_achat'              => 'required|in:COMPLET,GROUPAGE',
            'priorite'                => 'required|in:NORMALE,URGENTE',
            'date_livraison_souhaitee'=> 'nullable|date|after:today',
            'notes_client'            => 'nullable|string|max:1000',
        ]);

        $client = $this->getClient();
        DemandeImport::create([
            'client_id'               => $client->id,
            'numero_dossier'          => 'DOS-' . date('Y') . '-' . str_pad(DemandeImport::count() + 1, 4, '0', STR_PAD_LEFT),
            'type_achat'              => $request->type_achat,
            'priorite'                => $request->priorite,
            'date_livraison_souhaitee'=> $request->date_livraison_souhaitee,
            'notes_client'            => $request->notes_client,
            'statut'                  => 'SOUMISE',
        ]);

        return redirect(route('client.demands'))->with('success', 'Demande soumise avec succès.');
    }

    public function showDemand($id)
    {
        $client = $this->getClient();
        $demand = $client->demandes()->with(['devis', 'portOrigine', 'portDestination'])->findOrFail($id);
        return view('blade.client.demands_show', compact('demand'));
    }

    public function quotes()
    {
        $client = $this->getClient();
        $quotes = Devis::whereHas('demande', fn($q) => $q->where('client_id', $client->id))
                       ->with('demande')
                       ->orderByDesc('created_at')
                       ->paginate(20)->withQueryString();
        return view('blade.client.quotes', compact('quotes'));
    }

    public function showQuote($id)
    {
        $client = $this->getClient();
        $quote  = Devis::whereHas('demande', fn($q) => $q->where('client_id', $client->id))
                       ->with(['demande', 'lignes'])
                       ->findOrFail($id);
        return view('blade.client.quotes_show', compact('quote'));
    }

    public function acceptQuote(Request $request, $id)
    {
        $client = $this->getClient();
        $quote  = Devis::whereHas('demande', fn($q) => $q->where('client_id', $client->id))->findOrFail($id);

        if ($quote->statut !== 'ENVOYE') {
            return back()->with('error', 'Ce devis ne peut pas être accepté dans son état actuel.');
        }

        $quote->update(['statut' => 'ACCEPTE']);
        return back()->with('success', 'Devis accepté. Notre équipe va générer votre contrat.');
    }

    public function rejectQuote(Request $request, $id)
    {
        $client = $this->getClient();
        $quote  = Devis::whereHas('demande', fn($q) => $q->where('client_id', $client->id))->findOrFail($id);

        $quote->update([
            'statut'              => 'REFUSE',
            'commentaire_client'  => $request->input('commentaire_client'),
        ]);
        return back()->with('success', 'Devis refusé.');
    }

    public function contracts()
    {
        $client    = $this->getClient();
        $contracts = $client->contrats()->orderByDesc('created_at')->paginate(20)->withQueryString();
        return view('blade.client.contracts', compact('contracts'));
    }

    public function showContract($id)
    {
        $client   = $this->getClient();
        $contract = $client->contrats()->with(['devis', 'lignes.typeConteneur'])->findOrFail($id);
        return view('blade.client.contracts_show', compact('contract'));
    }

    public function invoices()
    {
        $client   = $this->getClient();
        $invoices = $client->factures()->orderByDesc('date_emission')->paginate(20)->withQueryString();
        return view('blade.client.invoices', compact('invoices'));
    }

    public function downloadInvoice($id)
    {
        $client  = $this->getClient();
        $invoice = $client->factures()->with(['contrat', 'devise', 'lignes'])->findOrFail($id);
        $pdf     = \Barryvdh\DomPDF\Facade\Pdf::loadView('blade.finance.invoices.pdf', compact('invoice'));
        return $pdf->download("facture-{$invoice->numero_facture}.pdf");
    }

    public function containers()
    {
        $client = $this->getClient();
        $containers = Conteneur::whereHas('mouvements', fn($q) => $q->where('client_id', $client->id))
                               ->with('type:id,code_type,libelle')
                               ->orderBy('numero_conteneur')
                               ->paginate(20)->withQueryString();
        return view('blade.client.containers', compact('containers'));
    }
}
