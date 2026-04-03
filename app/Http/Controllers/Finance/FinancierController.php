<?php

namespace App\Http\Controllers\Finance;

use App\Http\Controllers\Controller;

use App\Http\Controllers\Traits\Auditable;
use App\Models\Facture;
use App\Models\Devise;
use Illuminate\Http\JsonResponse;

class FinancierController extends Controller
{
    use Auditable;

    public function dashboard(): JsonResponse
    {
        // Invoices issued this month
        $invoicesThisMonth = Facture::whereMonth('date_emission', now()->month)
            ->whereYear('date_emission', now()->year);

        $invoicesPaid = Facture::where('statut', 'PAYEE')
            ->whereMonth('date_emission', now()->month)
            ->whereYear('date_emission', now()->year);

        // Overdue invoices (past due date, not fully paid)
        $overdueInvoices = Facture::whereNotIn('statut', ['PAYEE', 'ANNULEE'])
            ->whereDate('date_echeance', '<', today());

        // At-risk invoices (overdue > 20 days)
        $atRiskInvoices = Facture::whereNotIn('statut', ['PAYEE', 'ANNULEE'])
            ->whereDate('date_echeance', '<', today()->subDays(20))
            ->with('client')
            ->limit(10)
            ->get()
            ->map(fn($f) => [
                'id'              => $f->id,
                'numero_facture'  => $f->numero_facture,
                'client'          => $f->client?->raison_sociale,
                'montant_restant' => (float) $f->montant_restant,
                'date_echeance'   => $f->date_echeance,
                'jours_retard'    => today()->diffInDays($f->date_echeance),
            ]);

        // Exchange rates
        $devises = Devise::where('actif', true)
            ->whereIn('code', ['EUR', 'USD'])
            ->get()
            ->map(fn($d) => [
                'code'              => $d->code,
                'taux_actuel'       => (float) $d->taux_actuel,
                'source'            => $d->source,
                'date_derniere_maj' => $d->date_derniere_maj,
            ]);

        return response()->json([
            'invoices_issued' => [
                'count' => $invoicesThisMonth->count(),
                'sum'   => (float) $invoicesThisMonth->sum('montant_ttc'),
            ],
            'invoices_paid' => [
                'count' => $invoicesPaid->count(),
                'sum'   => (float) $invoicesPaid->sum('montant_ttc'),
            ],
            'invoices_overdue' => [
                'count' => $overdueInvoices->count(),
                'sum'   => (float) $overdueInvoices->sum('montant_restant'),
            ],
            'at_risk_invoices' => $atRiskInvoices,
            'exchange_rates'   => $devises,
        ]);
    }
}
