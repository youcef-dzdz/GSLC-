<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Facture {{ $invoice->numero_facture }}</title>
    <style>
        body { font-family: DejaVu Sans, sans-serif; font-size: 12px; color: #1a1a1a; margin: 0; padding: 20px; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px; border-bottom: 3px solid #0D1F3C; padding-bottom: 20px; }
        .company-name { font-size: 22px; font-weight: bold; color: #0D1F3C; }
        .company-sub { font-size: 11px; color: #6B7280; margin-top: 3px; }
        .invoice-title { font-size: 28px; font-weight: bold; color: #CFA030; text-align: right; }
        .invoice-number { font-size: 14px; color: #0D1F3C; text-align: right; font-family: monospace; }
        .section { margin-bottom: 20px; }
        .section-title { background: #0D1F3C; color: white; padding: 6px 12px; font-weight: bold; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; }
        .info-grid { display: flex; gap: 20px; }
        .info-box { flex: 1; padding: 12px; border: 1px solid #E2E8F0; background: #F8FAFC; }
        .info-label { font-size: 9px; color: #94A3B8; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 3px; }
        .info-value { font-size: 12px; font-weight: bold; color: #0D1F3C; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        thead th { background: #0D1F3C; color: white; padding: 8px 10px; text-align: left; font-size: 10px; text-transform: uppercase; }
        tbody td { padding: 8px 10px; border-bottom: 1px solid #E2E8F0; font-size: 11px; }
        tbody tr:nth-child(even) td { background: #F8FAFC; }
        .totals { float: right; width: 280px; border: 1px solid #E2E8F0; }
        .totals tr td { padding: 8px 12px; font-size: 12px; }
        .totals .total-row td { background: #0D1F3C; color: white; font-weight: bold; font-size: 14px; }
        .totals .label { color: #6B7280; }
        .footer { margin-top: 40px; padding-top: 15px; border-top: 1px solid #E2E8F0; font-size: 10px; color: #94A3B8; text-align: center; }
        .clearfix::after { content: ''; display: table; clear: both; }
    </style>
</head>
<body>

<div class="header">
    <div>
        <div class="company-name">NASHCO SPA</div>
        <div class="company-sub">Société de Navigation et de Consignation</div>
        <div class="company-sub">Port de Mostaganem — Algérie</div>
        <div class="company-sub" style="margin-top: 8px; color: #0D1F3C;">
            <strong>NIF:</strong> 000000000000000 &nbsp;&nbsp; <strong>RC:</strong> 00/00-0000000 B 00
        </div>
    </div>
    <div>
        <div class="invoice-title">FACTURE</div>
        <div class="invoice-number">{{ $invoice->numero_facture }}</div>
        <div style="text-align:right; color:#6B7280; font-size:11px; margin-top:5px;">
            Émise le {{ $invoice->date_emission->format('d/m/Y') }}<br>
            Échéance le {{ $invoice->date_echeance->format('d/m/Y') }}
        </div>
    </div>
</div>

<div class="info-grid" style="margin-bottom: 25px;">
    <div class="info-box">
        <div class="info-label">Facturé à</div>
        <div class="info-value">{{ $invoice->client?->raison_sociale }}</div>
        <div style="font-size:11px; color:#4B5563; margin-top:5px;">
            NIF: {{ $invoice->client?->nif }}<br>
            RC: {{ $invoice->client?->rc }}<br>
            {{ $invoice->client?->adresse_siege }}<br>
            {{ $invoice->client?->ville }}
        </div>
    </div>
    <div class="info-box">
        <div class="info-label">Contrat</div>
        <div class="info-value">{{ $invoice->contrat?->numero_contrat ?? '—' }}</div>
        <div style="font-size:11px; color:#4B5563; margin-top:5px;">
            Type: {{ $invoice->type_facture }}<br>
            Devise: {{ $invoice->devise?->code ?? 'DZD' }}<br>
            Statut: {{ str_replace('_', ' ', $invoice->statut) }}
        </div>
    </div>
</div>

@if(isset($invoice->lignes) && $invoice->lignes->isNotEmpty())
<div class="section">
    <div class="section-title">Détail des prestations</div>
    <table>
        <thead>
            <tr>
                <th>Description</th>
                <th style="text-align:right; width:100px;">Qté</th>
                <th style="text-align:right; width:130px;">P.U. HT</th>
                <th style="text-align:right; width:130px;">Total HT</th>
            </tr>
        </thead>
        <tbody>
            @foreach($invoice->lignes as $ligne)
            <tr>
                <td>{{ $ligne->description ?? $ligne->designation ?? '—' }}</td>
                <td style="text-align:right;">{{ $ligne->quantite ?? 1 }}</td>
                <td style="text-align:right;">{{ number_format($ligne->prix_unitaire ?? 0, 2) }}</td>
                <td style="text-align:right;">{{ number_format($ligne->montant_ht ?? ($ligne->prix_unitaire * $ligne->quantite), 2) }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
</div>
@endif

<div class="clearfix">
    <table class="totals">
        <tr><td class="label">Montant HT</td><td style="text-align:right;">{{ number_format($invoice->montant_ht, 2) }}</td></tr>
        <tr><td class="label">TVA</td><td style="text-align:right;">{{ number_format($invoice->tva, 2) }}</td></tr>
        <tr class="total-row"><td>Total TTC</td><td style="text-align:right;">{{ number_format($invoice->montant_ttc, 2) }} {{ $invoice->devise?->code ?? 'DZD' }}</td></tr>
        @if($invoice->montant_paye > 0)
        <tr><td class="label" style="color:#059669">Payé</td><td style="text-align:right; color:#059669;">{{ number_format($invoice->montant_paye, 2) }}</td></tr>
        <tr><td class="label" style="color:#DC2626">Restant dû</td><td style="text-align:right; color:#DC2626; font-weight:bold;">{{ number_format($invoice->montant_restant, 2) }}</td></tr>
        @endif
    </table>
</div>

@if($invoice->conditions_paiement)
<div style="margin-top: 20px; padding: 10px; background: #F8FAFC; border: 1px solid #E2E8F0; font-size: 11px;">
    <strong>Conditions de paiement :</strong> {{ $invoice->conditions_paiement }}
</div>
@endif

<div class="footer">
    NASHCO SPA — Port de Mostaganem — Algérie<br>
    Document généré le {{ now()->format('d/m/Y à H:i') }} — Système GSLC
</div>

</body>
</html>
