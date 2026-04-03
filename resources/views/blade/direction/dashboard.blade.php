@extends('layouts.gslc')
@section('page_title', 'Tableau de bord')

@section('content')

<div class="bg-white rounded-xl border border-[#E2E8F0] shadow-sm border-l-4 border-l-[#CFA030] p-4 mb-5 flex items-center justify-between">
    <div>
        <h1 class="text-2xl font-bold text-[#0D1F3C]">Tableau de bord — Direction</h1>
        <p class="text-sm text-[#6B7280]">NASHCO — Vue exécutive</p>
    </div>
    <img src="{{ asset('images/nashco_logo Company.jpg') }}" alt="NASHCO" class="h-12 w-auto rounded-lg">
</div>

{{-- Stats --}}
<div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
    <a href="{{ route('blade.direction.contracts', ['statut' => 'ACTIF']) }}"
       class="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-4 hover:border-emerald-300 transition-colors group">
        <div class="flex items-center justify-between mb-2">
            <p class="text-xs text-[#6B7280] uppercase tracking-wider">Contrats actifs</p>
            <div class="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-600 transition-colors">
                <i class="fas fa-file-contract text-emerald-600 group-hover:text-white"></i>
            </div>
        </div>
        <p class="text-3xl font-bold text-[#0D1F3C]">{{ $stats['contrats_actifs'] }}</p>
        <p class="text-xs text-[#94A3B8] mt-1">En vigueur</p>
    </a>

    <a href="{{ route('blade.direction.contracts', ['statut' => 'EN_ATTENTE_SIGNATURE']) }}"
       class="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-4 {{ $stats['en_attente_sign'] > 0 ? 'border-l-4 border-l-amber-400' : '' }} hover:border-amber-300 transition-colors group">
        <div class="flex items-center justify-between mb-2">
            <p class="text-xs text-[#6B7280] uppercase tracking-wider">À approuver</p>
            <div class="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center group-hover:bg-amber-500 transition-colors">
                <i class="fas fa-pen text-amber-500 group-hover:text-white"></i>
            </div>
        </div>
        <p class="text-3xl font-bold text-[#0D1F3C]">{{ $stats['en_attente_sign'] }}</p>
        <p class="text-xs text-[#94A3B8] mt-1">En attente de signature</p>
    </a>

    <div class="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-4">
        <div class="flex items-center justify-between mb-2">
            <p class="text-xs text-[#6B7280] uppercase tracking-wider">Clients</p>
            <div class="w-9 h-9 rounded-lg bg-[#EBF4FF] flex items-center justify-center">
                <i class="fas fa-building text-[#1A4A8C]"></i>
            </div>
        </div>
        <p class="text-3xl font-bold text-[#0D1F3C]">{{ $stats['clients_total'] }}</p>
        <p class="text-xs text-[#94A3B8] mt-1">Comptes actifs</p>
    </div>

    <div class="bg-[#0D1F3C] rounded-xl p-4">
        <div class="flex items-center justify-between mb-2">
            <p class="text-xs text-[#94A3B8] uppercase tracking-wider">CA ce mois</p>
            <div class="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center">
                <i class="fas fa-chart-line text-[#CFA030]"></i>
            </div>
        </div>
        <p class="text-xl font-bold text-white">{{ number_format($stats['ca_mois'], 0, ',', ' ') }}</p>
        <p class="text-xs text-[#94A3B8] mt-1">DZD TTC facturé</p>
    </div>
</div>

{{-- Quick links --}}
<div class="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-5">
    <h3 class="text-sm font-semibold text-[#0D1F3C] mb-4 flex items-center gap-2">
        <i class="fas fa-bolt text-[#CFA030]"></i> Accès rapides
    </h3>
    <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
        @foreach([
            ['route' => 'blade.direction.contracts', 'icon' => 'fa-file-contract', 'label' => 'Tous les contrats',      'color' => 'text-[#0D1F3C] bg-[#EDF2F7]'],
            ['route' => 'blade.direction.contracts', 'icon' => 'fa-pen',           'label' => 'Contrats à approuver',   'color' => 'text-amber-500 bg-amber-50'],
            ['route' => 'blade.direction.reports',   'icon' => 'fa-chart-bar',     'label' => 'Rapports',               'color' => 'text-[#1A4A8C] bg-[#EBF4FF]'],
        ] as $link)
        <a href="{{ route($link['route']) }}"
           class="flex flex-col items-center gap-2 p-4 rounded-xl border border-[#E2E8F0] hover:border-[#CFA030] hover:shadow-sm transition-all text-center">
            <div class="w-10 h-10 rounded-xl {{ $link['color'] }} flex items-center justify-center">
                <i class="fas {{ $link['icon'] }}"></i>
            </div>
            <span class="text-xs font-medium text-[#374151]">{{ $link['label'] }}</span>
        </a>
        @endforeach
    </div>
</div>

@endsection
