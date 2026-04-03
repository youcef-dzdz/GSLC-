@extends('layouts.gslc')
@section('page_title', $contract->numero_contrat)

@section('content')

<div class="bg-white rounded-xl border border-[#E2E8F0] shadow-sm border-l-4 border-l-[#CFA030] p-4 mb-5 flex items-center justify-between">
    <div>
        <div class="flex items-center gap-3 mb-1">
            <h1 class="text-2xl font-bold text-[#0D1F3C] font-mono">{{ $contract->numero_contrat }}</h1>
            @php
                $statColor = match($contract->statut) {
                    'ACTIF' => 'bg-emerald-50 text-emerald-700',
                    'TERMINE' => 'bg-slate-100 text-slate-600',
                    'ANNULE','RESILIE' => 'bg-red-50 text-red-700',
                    default => 'bg-amber-50 text-amber-700',
                };
            @endphp
            <span class="inline-flex px-2 py-1 rounded-full text-xs font-medium {{ $statColor }}">
                {{ str_replace('_', ' ', $contract->statut) }}
            </span>
        </div>
        <p class="text-sm text-[#6B7280]">{{ $contract->client?->raison_sociale }}</p>
    </div>
    @if(in_array(auth()->user()->role->label, ['directeur','admin']) && $contract->statut === 'EN_ATTENTE_SIGNATURE')
    <div class="flex gap-2">
        <form action="{{ route('blade.direction.contracts.approve', $contract->id) }}" method="POST">
            @csrf
            <button type="submit" class="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-3 py-2 text-sm font-medium transition-colors flex items-center gap-2">
                <i class="fas fa-check"></i> Approuver
            </button>
        </form>
    </div>
    @endif
    <img src="{{ asset('images/nashco_logo Company.jpg') }}" alt="NASHCO" class="h-12 w-auto rounded-lg">
</div>

<div class="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
    <div class="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">
        <div class="bg-[#F0F4F8] border-b border-[#E2E8F0] px-5 py-3">
            <h2 class="text-sm font-bold text-[#0D1F3C] uppercase tracking-wider">Détails du Contrat</h2>
        </div>
        <div class="p-5 space-y-3">
            <div class="grid grid-cols-2 gap-3">
                <div>
                    <p class="text-xs text-[#94A3B8] uppercase tracking-wider">Date début</p>
                    <p class="text-sm font-medium text-[#0D1F3C]">{{ \Carbon\Carbon::parse($contract->date_debut)->format('d/m/Y') }}</p>
                </div>
                <div>
                    <p class="text-xs text-[#94A3B8] uppercase tracking-wider">Date fin</p>
                    <p class="text-sm font-medium text-[#0D1F3C]">{{ \Carbon\Carbon::parse($contract->date_fin)->format('d/m/Y') }}</p>
                </div>
                <div>
                    <p class="text-xs text-[#94A3B8] uppercase tracking-wider">Type signature</p>
                    <p class="text-sm font-medium text-[#0D1F3C]">{{ $contract->type_signature }}</p>
                </div>
                @if($contract->date_signature)
                <div>
                    <p class="text-xs text-[#94A3B8] uppercase tracking-wider">Date signature</p>
                    <p class="text-sm font-medium text-[#0D1F3C]">{{ $contract->date_signature->format('d/m/Y') }}</p>
                </div>
                @endif
            </div>
            @if($contract->clauses_speciales)
            <div>
                <p class="text-xs text-[#94A3B8] uppercase tracking-wider mb-1">Clauses spéciales</p>
                <p class="text-sm text-[#4B5563] bg-[#F8FAFC] rounded-lg p-3">{{ $contract->clauses_speciales }}</p>
            </div>
            @endif
        </div>
    </div>

    <div class="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">
        <div class="bg-[#F0F4F8] border-b border-[#E2E8F0] px-5 py-3">
            <h2 class="text-sm font-bold text-[#0D1F3C] uppercase tracking-wider">Caution Bancaire</h2>
        </div>
        <div class="p-5 space-y-3">
            <div class="grid grid-cols-2 gap-3">
                @if($contract->montant_caution)
                <div>
                    <p class="text-xs text-[#94A3B8] uppercase tracking-wider">Montant caution</p>
                    <p class="text-sm font-bold text-[#0D1F3C]">{{ number_format($contract->montant_caution, 2) }} DZD</p>
                </div>
                @endif
                <div>
                    <p class="text-xs text-[#94A3B8] uppercase tracking-wider">Statut caution</p>
                    <span class="inline-flex px-2 py-0.5 rounded-full text-xs font-medium
                        {{ $contract->statut_caution === 'VERIFIE' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700' }}">
                        {{ $contract->statut_caution }}
                    </span>
                </div>
                @if($contract->numero_cheque)
                <div>
                    <p class="text-xs text-[#94A3B8] uppercase tracking-wider">N° chèque</p>
                    <p class="text-sm font-mono text-[#0D1F3C]">{{ $contract->numero_cheque }}</p>
                </div>
                @endif
                @if($contract->montant_cheque)
                <div>
                    <p class="text-xs text-[#94A3B8] uppercase tracking-wider">Montant chèque</p>
                    <p class="text-sm font-medium text-[#0D1F3C]">{{ number_format($contract->montant_cheque, 2) }} DZD</p>
                </div>
                @endif
            </div>
        </div>
    </div>
</div>

<div class="mt-4 flex items-center gap-3">
    <a href="{{ route('blade.commercial.contracts') }}" class="text-sm text-[#1A4A8C] hover:underline flex items-center gap-1">
        <i class="fas fa-arrow-left text-xs"></i> Retour à la liste
    </a>
    @if($contract->client)
    <a href="{{ route('blade.commercial.clients.show', $contract->client->id) }}" class="text-sm text-[#1A4A8C] hover:underline flex items-center gap-1">
        <i class="fas fa-user text-xs"></i> Voir le client
    </a>
    @endif
</div>

@endsection
