@extends('layouts.gslc')
@section('page_title', $invoice->numero_facture)

@section('content')

<div class="bg-white rounded-xl border border-[#E2E8F0] shadow-sm border-l-4 border-l-[#CFA030] p-4 mb-5 flex items-center justify-between">
    <div>
        <div class="flex items-center gap-3 mb-1">
            <h1 class="text-2xl font-bold text-[#0D1F3C] font-mono">{{ $invoice->numero_facture }}</h1>
            @php
                $statColor = match($invoice->statut) {
                    'PAYEE' => 'bg-emerald-50 text-emerald-700',
                    'EMISE','ENVOYEE' => 'bg-blue-50 text-blue-700',
                    'PARTIELLEMENT_PAYEE' => 'bg-amber-50 text-amber-700',
                    'LITIGE' => 'bg-orange-50 text-orange-700',
                    'ANNULEE' => 'bg-red-50 text-red-700',
                    default => 'bg-slate-100 text-slate-600',
                };
            @endphp
            <span class="inline-flex px-2 py-1 rounded-full text-xs font-medium {{ $statColor }}">{{ str_replace('_',' ',$invoice->statut) }}</span>
        </div>
        <p class="text-sm text-[#6B7280]">{{ $invoice->client?->raison_sociale }} — {{ $invoice->type_facture }}</p>
    </div>
    <div class="flex items-center gap-2">
        <a href="{{ route('blade.finance.invoices.pdf', $invoice->id) }}" target="_blank"
           class="bg-white border border-[#CBD5E1] text-[#0D1F3C] hover:bg-[#F0F4F8] rounded-lg px-3 py-2 text-sm transition-colors flex items-center gap-2">
            <i class="fas fa-file-pdf text-red-500"></i> PDF
        </a>
        @if(auth()->user()->hasPermission('invoices.emit') && in_array($invoice->statut, ['EMISE']))
        <form action="{{ route('blade.finance.invoices.emit', $invoice->id) }}" method="POST">
            @csrf
            <button type="submit" class="bg-[#0D1F3C] text-white hover:bg-[#1A4A8C] rounded-lg px-3 py-2 text-sm font-medium transition-colors flex items-center gap-2">
                <i class="fas fa-paper-plane"></i> Émettre
            </button>
        </form>
        @endif
        <img src="{{ asset('images/nashco_logo Company.jpg') }}" alt="NASHCO" class="h-12 w-auto rounded-lg">
    </div>
</div>

<div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
    <div class="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-4 text-center">
        <p class="text-xs text-[#94A3B8] uppercase mb-1">Montant HT</p>
        <p class="text-xl font-bold text-[#0D1F3C]">{{ number_format($invoice->montant_ht, 2) }}</p>
    </div>
    <div class="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-4 text-center">
        <p class="text-xs text-[#94A3B8] uppercase mb-1">TVA</p>
        <p class="text-xl font-bold text-[#0D1F3C]">{{ number_format($invoice->tva, 2) }}</p>
    </div>
    <div class="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-4 text-center">
        <p class="text-xs text-[#94A3B8] uppercase mb-1">Payé</p>
        <p class="text-xl font-bold text-emerald-600">{{ number_format($invoice->montant_paye, 2) }}</p>
    </div>
    <div class="bg-[#0D1F3C] rounded-xl p-4 text-center">
        <p class="text-xs text-[#CFA030] uppercase mb-1">Restant dû</p>
        <p class="text-xl font-bold text-white">{{ number_format($invoice->montant_restant, 2) }}</p>
        <p class="text-xs text-[#94A3B8]">{{ $invoice->devise?->code ?? 'DZD' }}</p>
    </div>
</div>

<div class="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
    <div class="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">
        <div class="bg-[#F0F4F8] border-b border-[#E2E8F0] px-5 py-3">
            <h2 class="text-sm font-bold text-[#0D1F3C] uppercase tracking-wider">Dates & Conditions</h2>
        </div>
        <div class="p-5 space-y-3">
            <div class="grid grid-cols-2 gap-3">
                <div>
                    <p class="text-xs text-[#94A3B8] uppercase tracking-wider">Date émission</p>
                    <p class="text-sm font-medium text-[#0D1F3C]">{{ $invoice->date_emission->format('d/m/Y') }}</p>
                </div>
                <div>
                    <p class="text-xs text-[#94A3B8] uppercase tracking-wider">Date échéance</p>
                    <p class="text-sm font-medium {{ now()->gt($invoice->date_echeance) && $invoice->statut !== 'PAYEE' ? 'text-red-600' : 'text-[#0D1F3C]' }}">
                        {{ $invoice->date_echeance->format('d/m/Y') }}
                    </p>
                </div>
            </div>
            @if($invoice->conditions_paiement)
            <div>
                <p class="text-xs text-[#94A3B8] uppercase tracking-wider mb-1">Conditions de paiement</p>
                <p class="text-sm text-[#4B5563]">{{ $invoice->conditions_paiement }}</p>
            </div>
            @endif
            @if($invoice->notes)
            <div>
                <p class="text-xs text-[#94A3B8] uppercase tracking-wider mb-1">Notes</p>
                <p class="text-sm text-[#4B5563]">{{ $invoice->notes }}</p>
            </div>
            @endif
        </div>
    </div>

    <div class="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">
        <div class="bg-[#F0F4F8] border-b border-[#E2E8F0] px-5 py-3">
            <h2 class="text-sm font-bold text-[#0D1F3C] uppercase tracking-wider">Client & Contrat</h2>
        </div>
        <div class="p-5 space-y-3">
            @if($invoice->client)
            <div>
                <p class="text-xs text-[#94A3B8] uppercase tracking-wider">Client</p>
                <p class="text-sm font-semibold text-[#0D1F3C]">{{ $invoice->client->raison_sociale }}</p>
                <p class="text-xs text-[#6B7280]">{{ $invoice->client->rep_email }}</p>
            </div>
            @endif
            @if($invoice->contrat)
            <div>
                <p class="text-xs text-[#94A3B8] uppercase tracking-wider">Contrat lié</p>
                <p class="text-sm font-mono text-[#1A4A8C]">{{ $invoice->contrat->numero_contrat }}</p>
            </div>
            @endif
            @if($invoice->creePar)
            <div>
                <p class="text-xs text-[#94A3B8] uppercase tracking-wider">Créé par</p>
                <p class="text-sm text-[#4B5563]">{{ $invoice->creePar->prenom }} {{ $invoice->creePar->nom }}</p>
            </div>
            @endif
        </div>
    </div>
</div>

{{-- Paiements --}}
@if(isset($invoice->paiements) && $invoice->paiements->isNotEmpty())
<div class="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden mb-5">
    <div class="bg-[#F0F4F8] border-b border-[#E2E8F0] px-5 py-3">
        <h2 class="text-sm font-bold text-[#0D1F3C] uppercase tracking-wider flex items-center gap-2">
            <i class="fas fa-credit-card text-[#CFA030]"></i> Paiements reçus
        </h2>
    </div>
    <table class="w-full">
        <thead class="bg-[#EDF2F7]">
            <tr>
                <th class="text-left text-xs font-semibold text-[#0D1F3C] uppercase px-4 py-2">Date</th>
                <th class="text-left text-xs font-semibold text-[#0D1F3C] uppercase px-4 py-2">Montant</th>
                <th class="text-left text-xs font-semibold text-[#0D1F3C] uppercase px-4 py-2">Mode</th>
                <th class="text-left text-xs font-semibold text-[#0D1F3C] uppercase px-4 py-2">Référence</th>
            </tr>
        </thead>
        <tbody>
            @foreach($invoice->paiements as $paiement)
            <tr class="border-b border-[#E2E8F0] hover:bg-[#EBF4FF] transition-colors">
                <td class="px-4 py-2.5 text-xs text-[#6B7280]">{{ $paiement->created_at->format('d/m/Y') }}</td>
                <td class="px-4 py-2.5 text-sm font-semibold text-emerald-600">{{ number_format($paiement->montant ?? 0, 2) }} DZD</td>
                <td class="px-4 py-2.5 text-sm text-[#4B5563]">{{ $paiement->mode_paiement ?? '—' }}</td>
                <td class="px-4 py-2.5 font-mono text-xs text-[#6B7280]">{{ $paiement->reference ?? '—' }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
</div>
@endif

<div class="mt-4">
    <a href="{{ route('blade.finance.invoices') }}" class="text-sm text-[#1A4A8C] hover:underline flex items-center gap-1">
        <i class="fas fa-arrow-left text-xs"></i> Retour à la liste
    </a>
</div>

@endsection
