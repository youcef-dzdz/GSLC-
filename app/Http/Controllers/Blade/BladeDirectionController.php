<?php

namespace App\Http\Controllers\Blade;

use App\Http\Controllers\Controller;
use App\Models\Client;
use App\Models\ContratImport;
use App\Models\DemandeImport;
use App\Models\Facture;
use Illuminate\Http\Request;

class BladeDirectionController extends Controller
{
    public function dashboard()
    {
        $stats = [
            'contrats_actifs'   => ContratImport::where('statut', 'ACTIF')->count(),
            'en_attente_sign'   => ContratImport::where('statut', 'EN_ATTENTE_SIGNATURE')->count(),
            'clients_total'     => Client::where('statut', 'APPROUVE')->count(),
            'ca_mois'           => Facture::whereMonth('date_emission', now()->month)
                                          ->whereYear('date_emission', now()->year)
                                          ->sum('montant_ttc'),
        ];
        return view('blade.direction.dashboard', compact('stats'));
    }

    public function contracts()
    {
        $search = request('search');
        $statut = request('statut');

        $query = ContratImport::with(['client:id,raison_sociale', 'creePar:id,nom,prenom'])
                              ->orderByDesc('created_at');

        if ($search) {
            $query->where(fn($q) => $q
                ->where('numero_contrat', 'ilike', "%{$search}%")
                ->orWhereHas('client', fn($c) => $c->where('raison_sociale', 'ilike', "%{$search}%"))
            );
        }
        if ($statut) $query->where('statut', $statut);

        $contracts = $query->paginate(20)->withQueryString();
        return view('blade.direction.contracts', compact('contracts', 'search'));
    }

    public function approveContract(Request $request, $id)
    {
        $contract = ContratImport::findOrFail($id);
        $contract->update(['statut' => 'ACTIF']);
        return back()->with('success', 'Contrat approuvé et activé.');
    }

    public function returnContract(Request $request, $id)
    {
        $request->validate(['motif' => 'required|string|max:500']);
        $contract = ContratImport::findOrFail($id);
        $contract->update([
            'statut'              => 'EN_ATTENTE_SIGNATURE',
            'clauses_speciales'   => $request->motif,
        ]);
        return back()->with('success', 'Contrat retourné pour révision.');
    }

    public function reports()
    {
        return view('blade.wip', ['page' => 'Rapports — En construction']);
    }
}
