@extends('layouts.gslc')
@section('page_title', 'Tableau de bord')

@section('content')

<div class="bg-white rounded-xl border border-[#E2E8F0] shadow-sm border-l-4 border-l-[#CFA030] p-4 mb-5 flex items-center justify-between">
    <div>
        <h1 class="text-2xl font-bold text-[#0D1F3C]">Tableau de bord — Finance</h1>
        <p class="text-sm text-[#6B7280]">NASHCO — Suivi financier</p>
    </div>
    <img src="{{ asset('images/nashco_logo Company.jpg') }}" alt="NASHCO" class="h-12 w-auto rounded-lg">
</div>

{{-- Stats --}}
<div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
    <a href="{{ route('blade.finance.invoices') }}"
       class="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-4 hover:border-[#1A4A8C] transition-colors group">
        <div class="flex items-center justify-between mb-2">
            <p class="text-xs text-[#6B7280] uppercase tracking-wider">Factures émises</p>
            <div class="w-9 h-9 rounded-lg bg-[#EBF4FF] flex items-center justify-center group-hover:bg-[#1A4A8C] transition-colors">
                <i class="fas fa-file-invoice text-[#1A4A8C] group-hover:text-white"></i>
            </div>
        </div>
        <p class="text-3xl font-bold text-[#0D1F3C]">{{ $stats['factures_emises'] }}</p>
        <p class="text-xs text-[#94A3B8] mt-1">En attente de paiement</p>
    </a>

    <div class="bg-[#0D1F3C] rounded-xl p-4">
        <div class="flex items-center justify-between mb-2">
            <p class="text-xs text-[#94A3B8] uppercase tracking-wider">Total encaissé</p>
            <div class="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center">
                <i class="fas fa-check-circle text-[#CFA030]"></i>
            </div>
        </div>
        <p class="text-2xl font-bold text-white">{{ number_format($stats['total_encaisse'], 0, ',', ' ') }}</p>
        <p class="text-xs text-[#94A3B8] mt-1">DZD — Total paiements</p>
    </div>

    <div class="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-4">
        <div class="flex items-center justify-between mb-2">
            <p class="text-xs text-[#6B7280] uppercase tracking-wider">Créances</p>
            <div class="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center">
                <i class="fas fa-hourglass-half text-amber-500"></i>
            </div>
        </div>
        <p class="text-2xl font-bold text-[#0D1F3C]">{{ number_format($stats['total_du'], 0, ',', ' ') }}</p>
        <p class="text-xs text-[#94A3B8] mt-1">DZD restant dû</p>
    </div>

    <a href="{{ route('blade.finance.invoices', ['statut' => 'EN_RETARD']) }}"
       class="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-4 {{ $stats['en_retard'] > 0 ? 'border-l-4 border-l-red-400' : '' }} hover:border-red-300 transition-colors group">
        <div class="flex items-center justify-between mb-2">
            <p class="text-xs text-[#6B7280] uppercase tracking-wider">En retard</p>
            <div class="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center group-hover:bg-red-600 transition-colors">
                <i class="fas fa-exclamation-triangle text-red-500 group-hover:text-white"></i>
            </div>
        </div>
        <p class="text-3xl font-bold text-[#0D1F3C]">{{ $stats['en_retard'] }}</p>
        <p class="text-xs text-[#94A3B8] mt-1">Échéances dépassées</p>
    </a>
</div>

{{-- Quick links --}}
<div class="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-5">
    <h3 class="text-sm font-semibold text-[#0D1F3C] mb-4 flex items-center gap-2">
        <i class="fas fa-bolt text-[#CFA030]"></i> Accès rapides
    </h3>
    <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
        @foreach([
            ['route' => 'blade.finance.invoices',  'icon' => 'fa-file-invoice', 'label' => 'Toutes les factures',  'color' => 'text-[#1A4A8C] bg-[#EBF4FF]'],
            ['route' => 'blade.finance.payments',  'icon' => 'fa-credit-card',  'label' => 'Paiements reçus',      'color' => 'text-emerald-600 bg-emerald-50'],
            ['route' => 'blade.finance.invoices',  'icon' => 'fa-exclamation-triangle', 'label' => 'Factures en retard', 'color' => 'text-red-500 bg-red-50'],
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
