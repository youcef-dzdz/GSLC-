<?php

namespace App\Http\Controllers\Blade;

use App\Http\Controllers\Controller;
use App\Models\Facture;
use App\Models\Paiement;
use Illuminate\Http\Request;

class BladeFinanceController extends Controller
{
    public function dashboard()
    {
        $stats = [
            'factures_emises'   => Facture::whereIn('statut', ['EMISE', 'ENVOYEE'])->count(),
            'total_du'          => Facture::whereNotIn('statut', ['ANNULEE'])->sum('montant_restant'),
            'total_encaisse'    => Facture::sum('montant_paye'),
            'en_retard'         => Facture::whereNotIn('statut', ['PAYEE', 'ANNULEE'])
                                          ->where('date_echeance', '<', now())->count(),
        ];
        return view('blade.finance.dashboard', compact('stats'));
    }

    public function invoices()
    {
        $search = request('search');
        $statut = request('statut');
        $type   = request('type_facture');

        $query = Facture::with(['client:id,raison_sociale', 'creePar:id,nom,prenom'])
                        ->orderByDesc('date_emission');

        if ($search) {
            $query->where(fn($q) => $q
                ->where('numero_facture', 'ilike', "%{$search}%")
                ->orWhereHas('client', fn($c) => $c->where('raison_sociale', 'ilike', "%{$search}%"))
            );
        }
        if ($statut) $query->where('statut', $statut);
        if ($type)   $query->where('type_facture', $type);

        $invoices = $query->paginate(20)->withQueryString();
        return view('blade.finance.invoices.index', compact('invoices', 'search'));
    }

    public function showInvoice($id)
    {
        $invoice = Facture::with([
            'client', 'contrat', 'devise', 'creePar', 'lignes',
            'paiements' => fn($q) => $q->orderByDesc('created_at'),
        ])->findOrFail($id);

        return view('blade.finance.invoices.show', compact('invoice'));
    }

    public function emitInvoice(Request $request, $id)
    {
        $invoice = Facture::findOrFail($id);

        if (!in_array($invoice->statut, ['EMISE', 'BROUILLON'])) {
            return back()->with('error', 'Cette facture ne peut pas être émise dans son état actuel.');
        }

        $invoice->update([
            'statut'         => 'ENVOYEE',
            'date_emission'  => now(),
        ]);

        return back()->with('success', 'Facture émise et envoyée au client.');
    }

    public function downloadPdf($id)
    {
        $invoice = Facture::with(['client', 'contrat', 'devise', 'lignes'])->findOrFail($id);
        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('blade.finance.invoices.pdf', compact('invoice'));
        return $pdf->download("facture-{$invoice->numero_facture}.pdf");
    }

    public function payments()
    {
        $search  = request('search');
        $dateFrom = request('date_from');
        $dateTo   = request('date_to');

        $query = Paiement::with([
            'facture.client:id,raison_sociale',
        ])->orderByDesc('created_at');

        if ($search) {
            $query->whereHas('facture', fn($q) => $q
                ->where('numero_facture', 'ilike', "%{$search}%")
                ->orWhereHas('client', fn($c) => $c->where('raison_sociale', 'ilike', "%{$search}%"))
            );
        }
        if ($dateFrom) $query->whereDate('created_at', '>=', $dateFrom);
        if ($dateTo)   $query->whereDate('created_at', '<=', $dateTo);

        $payments = $query->paginate(20)->withQueryString();
        return view('blade.finance.payments', compact('payments', 'search'));
    }
}
