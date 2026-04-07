@extends('layouts.gslc')
@section('page_title', $t('Dashboard'))

@section('content')

<div class="bg-white rounded-xl border border-[#E2E8F0] shadow-sm border-l-4 border-l-[#CFA030] p-4 mb-5 flex items-center justify-between">
    <div>
        <h1 class="text-2xl font-bold text-[#0D1F3C]">{{ $t('Bienvenue') }}, {{ $client->raison_sociale }}</h1>
        <p class="text-sm text-[#6B7280]">{{ $t('Portail client NASHCO —') }} {{ $client->type_client }}</p>
    </div>
    <img src="{{ asset('images/nashco_logo Company.jpg') }}" alt="NASHCO" class="h-12 w-auto rounded-lg">
</div>

{{-- Stats --}}
<div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
    <a href="{{ route('client.demands') }}"
       class="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-4 hover:border-[#1A4A8C] transition-colors group">
        <div class="flex items-center justify-between mb-2">
            <p class="text-xs text-[#6B7280] uppercase tracking-wider">{{ $t('Mes demandes') }}</p>
            <div class="w-9 h-9 rounded-lg bg-[#EBF4FF] flex items-center justify-center group-hover:bg-[#1A4A8C] transition-colors">
                <i class="fas fa-inbox text-[#1A4A8C] group-hover:text-white"></i>
            </div>
        </div>
        <p class="text-3xl font-bold text-[#0D1F3C]">{{ $stats['demandes'] }}</p>
        <p class="text-xs text-[#94A3B8] mt-1">{{ $t('Total soumis') }}</p>
    </a>

    <a href="{{ route('client.contracts') }}"
       class="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-4 hover:border-emerald-300 transition-colors group">
        <div class="flex items-center justify-between mb-2">
            <p class="text-xs text-[#6B7280] uppercase tracking-wider">{{ $t('Contrats actifs') }}</p>
            <div class="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-600 transition-colors">
                <i class="fas fa-file-contract text-emerald-600 group-hover:text-white"></i>
            </div>
        </div>
        <p class="text-3xl font-bold text-[#0D1F3C]">{{ $stats['contrats'] }}</p>
        <p class="text-xs text-[#94A3B8] mt-1">{{ $t('En vigueur') }}</p>
    </a>

    <a href="{{ route('client.invoices') }}"
       class="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-4 hover:border-amber-300 transition-colors group">
        <div class="flex items-center justify-between mb-2">
            <p class="text-xs text-[#6B7280] uppercase tracking-wider">{{ $t('Factures ouvertes') }}</p>
            <div class="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center group-hover:bg-amber-500 transition-colors">
                <i class="fas fa-file-invoice text-amber-500 group-hover:text-white"></i>
            </div>
        </div>
        <p class="text-3xl font-bold text-[#0D1F3C]">{{ $stats['factures'] }}</p>
        <p class="text-xs text-[#94A3B8] mt-1">{{ $t('En attente de paiement') }}</p>
    </a>

    <div class="bg-[#0D1F3C] rounded-xl p-4">
        <div class="flex items-center justify-between mb-2">
            <p class="text-xs text-[#94A3B8] uppercase tracking-wider">{{ $t('Solde dû') }}</p>
            <div class="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center">
                <i class="fas fa-wallet text-[#CFA030]"></i>
            </div>
        </div>
        <p class="text-xl font-bold text-white">{{ number_format($stats['solde_du'], 0, ',', ' ') }}</p>
        <p class="text-xs text-[#94A3B8] mt-1">{{ $t('DZD restant') }}</p>
    </div>
</div>

{{-- Recent demands --}}
<div class="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-5 mb-4">
    <div class="flex items-center justify-between mb-4">
        <h3 class="text-sm font-semibold text-[#0D1F3C] flex items-center gap-2">
            <i class="fas fa-clock text-[#CFA030]"></i> {{ $t('Dernières demandes') }}
        </h3>
        <a href="{{ route('client.demands') }}" class="text-xs text-[#1A4A8C] hover:underline">{{ $t('Tout voir') }}</a>
    </div>

    @if($recentDemands->isEmpty())
    <p class="text-sm text-[#94A3B8] text-center py-6">{{ $t('Aucune demande soumise') }}</p>
    @else
    <div class="space-y-2">
        @foreach($recentDemands as $demand)
        @php
            $statusColor = match($demand->statut) {
                'SOUMISE'  => 'bg-amber-50 text-amber-700',
                'EN_COURS' => 'bg-blue-50 text-blue-700',
                'TRAITEE'  => 'bg-emerald-50 text-emerald-700',
                'ANNULEE'  => 'bg-red-50 text-red-700',
                default    => 'bg-slate-100 text-slate-600',
            };
        @endphp
        <a href="{{ route('client.demands.show', $demand->id) }}"
           class="flex items-center gap-3 p-3 rounded-lg hover:bg-[#F0F4F8] transition-colors border border-transparent hover:border-[#E2E8F0]">
            <div class="flex-shrink-0 w-8 h-8 rounded-lg bg-[#EBF4FF] flex items-center justify-center">
                <i class="fas fa-inbox text-[#1A4A8C] text-xs"></i>
            </div>
            <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-[#0D1F3C]">{{ $demand->numero_dossier }}</p>
                <p class="text-xs text-[#94A3B8]">{{ $demand->created_at->format('d/m/Y') }} — {{ $demand->type_achat }}</p>
            </div>
            <span class="text-xs px-2 py-0.5 rounded-full {{ $statusColor }} flex-shrink-0">{{ $t($demand->statut) }}</span>
            @if($demand->priorite === 'URGENTE')
            <span class="text-xs bg-red-50 text-red-600 px-1.5 py-0.5 rounded font-semibold flex-shrink-0">{{ $t('URGENTE') }}</span>
            @endif
        </a>
        @endforeach
    </div>
    @endif
</div>

{{-- Quick actions --}}
<div class="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-5">
    <h3 class="text-sm font-semibold text-[#0D1F3C] mb-4 flex items-center gap-2">
        <i class="fas fa-bolt text-[#CFA030]"></i> {{ $t('Actions rapides') }}
    </h3>
    <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
        @foreach([
            ['route' => 'client.demands.create', 'icon' => 'fa-plus-circle',  'key' => 'Nouvelle demande', 'color' => 'text-[#CFA030] bg-amber-50'],
            ['route' => 'client.quotes',         'icon' => 'fa-file-alt',     'key' => 'Mes devis',        'color' => 'text-blue-600 bg-blue-50'],
            ['route' => 'client.invoices',       'icon' => 'fa-file-invoice', 'key' => 'Mes factures',     'color' => 'text-amber-500 bg-amber-50'],
            ['route' => 'client.containers',     'icon' => 'fa-box',          'key' => 'Mes conteneurs',   'color' => 'text-[#1A4A8C] bg-[#EBF4FF]'],
        ] as $link)
        <a href="{{ route($link['route']) }}"
           class="flex flex-col items-center gap-2 p-4 rounded-xl border border-[#E2E8F0] hover:border-[#CFA030] hover:shadow-sm transition-all text-center">
            <div class="w-10 h-10 rounded-xl {{ $link['color'] }} flex items-center justify-center">
                <i class="fas {{ $link['icon'] }}"></i>
            </div>
            <span class="text-xs font-medium text-[#374151]">{{ $t($link['key']) }}</span>
        </a>
        @endforeach
    </div>
</div>

@endsection
