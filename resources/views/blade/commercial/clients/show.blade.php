@extends('layouts.gslc')
@section('page_title', $client->raison_sociale)

@section('content')

{{-- Header --}}
<div class="bg-white rounded-xl border border-[#E2E8F0] shadow-sm border-l-4 border-l-[#CFA030] p-4 mb-5 flex items-center justify-between">
    <div>
        <div class="flex items-center gap-3 mb-1">
            <h1 class="text-2xl font-bold text-[#0D1F3C]">{{ $client->raison_sociale }}</h1>
            @php
                $badgeClass = match($client->statut) {
                    'APPROUVE' => 'bg-emerald-50 text-emerald-700',
                    'EN_ATTENTE_VALIDATION' => 'bg-amber-50 text-amber-700',
                    'REJETE' => 'bg-red-50 text-red-700',
                    'SUSPENDU' => 'bg-slate-100 text-slate-600',
                    default => 'bg-slate-100 text-slate-600',
                };
            @endphp
            <span class="inline-flex px-2 py-1 rounded-full text-xs font-medium {{ $badgeClass }}">{{ $client->statut }}</span>
        </div>
        <p class="text-sm text-[#6B7280]">{{ $client->type_client }} — {{ $client->ville }}</p>
    </div>
    <div class="flex items-center gap-3">
        <a href="{{ route('blade.commercial.clients.edit', $client->id) }}"
           class="bg-[#0D1F3C] text-white hover:bg-[#1A4A8C] rounded-lg px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2">
            <i class="fas fa-pencil"></i> Modifier
        </a>
        <img src="{{ asset('images/nashco_logo Company.jpg') }}" alt="NASHCO" class="h-12 w-auto rounded-lg">
    </div>
</div>

{{-- Stats cards --}}
<div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
    <div class="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-4">
        <p class="text-xs text-[#6B7280] uppercase tracking-wider mb-1">Contrats</p>
        <p class="text-2xl font-bold text-[#0D1F3C]">{{ $stats['contrats'] }}</p>
    </div>
    <div class="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-4">
        <p class="text-xs text-[#6B7280] uppercase tracking-wider mb-1">Total facturé</p>
        <p class="text-2xl font-bold text-[#0D1F3C]">{{ number_format($stats['facture_total'], 2) }}</p>
        <p class="text-xs text-[#94A3B8]">DZD</p>
    </div>
    <div class="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-4">
        <p class="text-xs text-[#6B7280] uppercase tracking-wider mb-1">Total payé</p>
        <p class="text-2xl font-bold text-emerald-600">{{ number_format($stats['facture_paye'], 2) }}</p>
        <p class="text-xs text-[#94A3B8]">DZD</p>
    </div>
    <div class="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-4">
        <p class="text-xs text-[#6B7280] uppercase tracking-wider mb-1">Solde dû</p>
        <p class="text-2xl font-bold {{ $stats['solde'] > 0 ? 'text-red-600' : 'text-emerald-600' }}">{{ number_format($stats['solde'], 2) }}</p>
        <p class="text-xs text-[#94A3B8]">DZD</p>
    </div>
</div>

<div class="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
    {{-- Client info --}}
    <div class="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">
        <div class="bg-[#F0F4F8] border-b border-[#E2E8F0] px-5 py-3">
            <h2 class="text-sm font-bold text-[#0D1F3C] uppercase tracking-wider flex items-center gap-2">
                <i class="fas fa-building text-[#CFA030]"></i> Informations Entreprise
            </h2>
        </div>
        <div class="p-5 space-y-3">
            <div class="grid grid-cols-2 gap-3">
                <div>
                    <p class="text-xs text-[#94A3B8] uppercase tracking-wider">NIF</p>
                    <p class="font-mono text-sm text-[#0D1F3C] font-medium">{{ $client->nif }}</p>
                </div>
                <div>
                    <p class="text-xs text-[#94A3B8] uppercase tracking-wider">NIS</p>
                    <p class="font-mono text-sm text-[#0D1F3C] font-medium">{{ $client->nis }}</p>
                </div>
                <div>
                    <p class="text-xs text-[#94A3B8] uppercase tracking-wider">RC</p>
                    <p class="font-mono text-sm text-[#0D1F3C] font-medium">{{ $client->rc }}</p>
                </div>
                <div>
                    <p class="text-xs text-[#94A3B8] uppercase tracking-wider">Type</p>
                    <p class="text-sm text-[#0D1F3C]">{{ $client->type_client }}</p>
                </div>
            </div>
            <div>
                <p class="text-xs text-[#94A3B8] uppercase tracking-wider">Adresse</p>
                <p class="text-sm text-[#4B5563]">{{ $client->adresse_siege }}</p>
                <p class="text-sm text-[#4B5563]">{{ $client->ville }}@if($client->pays) — {{ $client->pays->nom_pays }}@endif</p>
            </div>
            <div class="pt-2 border-t border-[#E2E8F0]">
                <p class="text-xs text-[#94A3B8]">Validé par {{ $client->validePar?->prenom }} {{ $client->validePar?->nom }}</p>
                @if($client->date_validation)
                <p class="text-xs text-[#94A3B8]">le {{ $client->date_validation->format('d/m/Y') }}</p>
                @endif
            </div>
        </div>
    </div>

    {{-- Représentant info --}}
    <div class="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">
        <div class="bg-[#F0F4F8] border-b border-[#E2E8F0] px-5 py-3">
            <h2 class="text-sm font-bold text-[#0D1F3C] uppercase tracking-wider flex items-center gap-2">
                <i class="fas fa-user-tie text-[#CFA030]"></i> Représentant Légal
            </h2>
        </div>
        <div class="p-5 space-y-4">
            <div class="flex items-center gap-4">
                <div class="w-12 h-12 rounded-full bg-[#EDF2F7] flex items-center justify-center">
                    <span class="text-[#0D1F3C] font-bold text-lg">
                        {{ strtoupper(substr($client->rep_prenom, 0, 1)) }}{{ strtoupper(substr($client->rep_nom, 0, 1)) }}
                    </span>
                </div>
                <div>
                    <p class="font-semibold text-[#0D1F3C]">{{ $client->rep_prenom }} {{ $client->rep_nom }}</p>
                    <p class="text-sm text-[#6B7280]">{{ $client->rep_role }}</p>
                </div>
            </div>
            <div class="space-y-2">
                <div class="flex items-center gap-2 text-sm text-[#4B5563]">
                    <i class="fas fa-envelope text-[#94A3B8] w-4"></i>
                    {{ $client->rep_email }}
                </div>
                <div class="flex items-center gap-2 text-sm text-[#4B5563]">
                    <i class="fas fa-phone text-[#94A3B8] w-4"></i>
                    {{ $client->rep_tel }}
                </div>
            </div>
            @if($client->user)
            <div class="pt-3 border-t border-[#E2E8F0]">
                <p class="text-xs text-[#94A3B8] mb-1">Compte d'accès</p>
                <span class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium
                    {{ $client->user->statut === 'ACTIF' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700' }}">
                    <i class="fas fa-circle text-[0.5rem]"></i>
                    {{ $client->user->statut }}
                </span>
            </div>
            @endif
        </div>
    </div>
</div>

{{-- Recent demands --}}
@if($client->demandes->isNotEmpty())
<div class="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">
    <div class="bg-[#F0F4F8] border-b border-[#E2E8F0] px-5 py-3 flex items-center justify-between">
        <h2 class="text-sm font-bold text-[#0D1F3C] uppercase tracking-wider flex items-center gap-2">
            <i class="fas fa-inbox text-[#CFA030]"></i> Dernières Demandes
        </h2>
        <a href="{{ route('blade.commercial.demands') }}?client={{ $client->id }}" class="text-xs text-[#1A4A8C] hover:underline">Voir tout</a>
    </div>
    <table class="w-full">
        <thead class="bg-[#EDF2F7]">
            <tr>
                <th class="text-left text-xs font-semibold text-[#0D1F3C] uppercase tracking-wider px-4 py-2">N° Dossier</th>
                <th class="text-left text-xs font-semibold text-[#0D1F3C] uppercase tracking-wider px-4 py-2">Type</th>
                <th class="text-left text-xs font-semibold text-[#0D1F3C] uppercase tracking-wider px-4 py-2">Priorité</th>
                <th class="text-left text-xs font-semibold text-[#0D1F3C] uppercase tracking-wider px-4 py-2">Statut</th>
                <th class="text-left text-xs font-semibold text-[#0D1F3C] uppercase tracking-wider px-4 py-2">Date</th>
            </tr>
        </thead>
        <tbody>
            @foreach($client->demandes as $demande)
            <tr class="border-b border-[#E2E8F0] hover:bg-[#EBF4FF] transition-colors">
                <td class="px-4 py-2.5">
                    <a href="{{ route('blade.commercial.demands.show', $demande->id) }}"
                       class="font-mono text-xs text-[#1A4A8C] hover:underline">{{ $demande->numero_dossier }}</a>
                </td>
                <td class="px-4 py-2.5 text-sm text-[#4B5563]">{{ $demande->type_achat }}</td>
                <td class="px-4 py-2.5">
                    <span class="text-xs {{ $demande->priorite === 'URGENTE' ? 'text-red-600 font-semibold' : 'text-[#4B5563]' }}">
                        {{ $demande->priorite }}
                    </span>
                </td>
                <td class="px-4 py-2.5">
                    <span class="inline-flex px-2 py-0.5 rounded-full text-xs font-medium
                        {{ in_array($demande->statut, ['ACCEPTEE','TERMINEE']) ? 'bg-emerald-50 text-emerald-700' :
                           ($demande->statut === 'EN_COURS' ? 'bg-blue-50 text-blue-700' :
                           ($demande->statut === 'REJETEE' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700')) }}">
                        {{ $demande->statut }}
                    </span>
                </td>
                <td class="px-4 py-2.5 text-xs text-[#94A3B8]">{{ $demande->date_soumission->format('d/m/Y') }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
</div>
@endif

<div class="mt-4">
    <a href="{{ route('blade.commercial.clients') }}"
       class="text-sm text-[#1A4A8C] hover:underline flex items-center gap-1">
        <i class="fas fa-arrow-left text-xs"></i> Retour à la liste
    </a>
</div>

@endsection
