@extends('layouts.gslc')
@section('page_title', $quote->numero_devis)

@section('content')

<div class="bg-white rounded-xl border border-[#E2E8F0] shadow-sm border-l-4 border-l-[#CFA030] p-4 mb-5 flex items-center justify-between">
    <div>
        <div class="flex items-center gap-3 mb-1">
            <h1 class="text-2xl font-bold text-[#0D1F3C] font-mono">{{ $quote->numero_devis }}</h1>
            <span class="text-xs bg-[#EDF2F7] text-[#475569] px-2 py-0.5 rounded">v{{ $quote->version }}</span>
            @php
                $statColor = match($quote->statut) {
                    'ACCEPTE' => 'bg-emerald-50 text-emerald-700',
                    'REFUSE','EXPIRE' => 'bg-red-50 text-red-700',
                    'ENVOYE' => 'bg-blue-50 text-blue-700',
                    'EN_NEGOCIATION' => 'bg-amber-50 text-amber-700',
                    default => 'bg-slate-100 text-slate-600',
                };
            @endphp
            <span class="inline-flex px-2 py-1 rounded-full text-xs font-medium {{ $statColor }}">{{ str_replace('_',' ', $quote->statut) }}</span>
        </div>
        <p class="text-sm text-[#6B7280]">{{ $quote->demande?->client?->raison_sociale }}</p>
    </div>
    <img src="{{ asset('images/nashco_logo Company.jpg') }}" alt="NASHCO" class="h-12 w-auto rounded-lg">
</div>

<div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
    <div class="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-4 text-center">
        <p class="text-xs text-[#94A3B8] uppercase mb-1">Montant HT</p>
        <p class="text-xl font-bold text-[#0D1F3C]">{{ number_format($quote->montant_ht, 2) }}</p>
        <p class="text-xs text-[#94A3B8]">DZD</p>
    </div>
    <div class="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-4 text-center">
        <p class="text-xs text-[#94A3B8] uppercase mb-1">TVA</p>
        <p class="text-xl font-bold text-[#0D1F3C]">{{ number_format($quote->tva, 2) }}</p>
        <p class="text-xs text-[#94A3B8]">DZD</p>
    </div>
    <div class="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-4 text-center bg-[#0D1F3C]">
        <p class="text-xs text-[#CFA030] uppercase mb-1">Total TTC</p>
        <p class="text-xl font-bold text-white">{{ number_format($quote->total_ttc, 2) }}</p>
        <p class="text-xs text-[#94A3B8]">DZD</p>
    </div>
</div>

<div class="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
    <div class="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">
        <div class="bg-[#F0F4F8] border-b border-[#E2E8F0] px-5 py-3">
            <h2 class="text-sm font-bold text-[#0D1F3C] uppercase tracking-wider">Détails</h2>
        </div>
        <div class="p-5 space-y-3">
            @if($quote->date_envoi)
            <div>
                <p class="text-xs text-[#94A3B8] uppercase tracking-wider">Date d'envoi</p>
                <p class="text-sm text-[#4B5563]">{{ $quote->date_envoi->format('d/m/Y H:i') }}</p>
            </div>
            @endif
            @if($quote->date_expiration)
            <div>
                <p class="text-xs text-[#94A3B8] uppercase tracking-wider">Expiration</p>
                <p class="text-sm text-[#4B5563]">{{ \Carbon\Carbon::parse($quote->date_expiration)->format('d/m/Y') }}</p>
            </div>
            @endif
            @if($quote->commentaire_nashco)
            <div>
                <p class="text-xs text-[#94A3B8] uppercase tracking-wider mb-1">Commentaire NASHCO</p>
                <p class="text-sm text-[#4B5563] bg-[#F8FAFC] rounded-lg p-3">{{ $quote->commentaire_nashco }}</p>
            </div>
            @endif
            @if($quote->commentaire_client)
            <div>
                <p class="text-xs text-amber-500 uppercase tracking-wider mb-1">Réponse Client</p>
                <p class="text-sm text-[#4B5563] bg-amber-50 rounded-lg p-3">{{ $quote->commentaire_client }}</p>
            </div>
            @endif
        </div>
    </div>

    <div class="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">
        <div class="bg-[#F0F4F8] border-b border-[#E2E8F0] px-5 py-3">
            <h2 class="text-sm font-bold text-[#0D1F3C] uppercase tracking-wider">Demande liée</h2>
        </div>
        <div class="p-5">
            @if($quote->demande)
            <p class="font-mono text-sm text-[#1A4A8C]">{{ $quote->demande->numero_dossier }}</p>
            <p class="text-sm text-[#4B5563] mt-1">{{ $quote->demande->type_achat }} — {{ $quote->demande->priorite }}</p>
            <a href="{{ route('blade.commercial.demands.show', $quote->demande->id) }}"
               class="text-xs text-[#1A4A8C] hover:underline mt-2 inline-block">
                <i class="fas fa-external-link-alt mr-1"></i> Voir la demande
            </a>
            @endif
        </div>
    </div>
</div>

<div class="mt-4">
    <a href="{{ route('blade.commercial.quotes') }}" class="text-sm text-[#1A4A8C] hover:underline flex items-center gap-1">
        <i class="fas fa-arrow-left text-xs"></i> Retour à la liste
    </a>
</div>

@endsection
