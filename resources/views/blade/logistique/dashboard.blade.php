@extends('layouts.gslc')
@section('page_title', 'Tableau de bord')

@section('content')

<div class="bg-white rounded-xl border border-[#E2E8F0] shadow-sm border-l-4 border-l-[#CFA030] p-4 mb-5 flex items-center justify-between">
    <div>
        <h1 class="text-2xl font-bold text-[#0D1F3C]">Tableau de bord — Logistique</h1>
        <p class="text-sm text-[#6B7280]">NASHCO — Parc conteneurs & Gate</p>
    </div>
    <img src="{{ asset('images/nashco_logo Company.jpg') }}" alt="NASHCO" class="h-12 w-auto rounded-lg">
</div>

{{-- Stats --}}
<div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
    <a href="{{ route('blade.logistique.containers') }}"
       class="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-4 hover:border-[#1A4A8C] transition-colors group">
        <div class="flex items-center justify-between mb-2">
            <p class="text-xs text-[#6B7280] uppercase tracking-wider">Parc total</p>
            <div class="w-9 h-9 rounded-lg bg-[#EDF2F7] flex items-center justify-center group-hover:bg-[#0D1F3C] transition-colors">
                <i class="fas fa-boxes text-[#0D1F3C] group-hover:text-white"></i>
            </div>
        </div>
        <p class="text-3xl font-bold text-[#0D1F3C]">{{ $stats['total'] }}</p>
        <p class="text-xs text-[#94A3B8] mt-1">Conteneurs enregistrés</p>
    </a>

    <a href="{{ route('blade.logistique.containers', ['statut' => 'DISPONIBLE']) }}"
       class="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-4 hover:border-emerald-300 transition-colors group">
        <div class="flex items-center justify-between mb-2">
            <p class="text-xs text-[#6B7280] uppercase tracking-wider">Disponibles</p>
            <div class="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-600 transition-colors">
                <i class="fas fa-check-circle text-emerald-600 group-hover:text-white"></i>
            </div>
        </div>
        <p class="text-3xl font-bold text-[#0D1F3C]">{{ $stats['disponible'] }}</p>
        <p class="text-xs text-[#94A3B8] mt-1">Prêts à l'attribution</p>
    </a>

    <a href="{{ route('blade.logistique.containers', ['statut' => 'LIVRAISON_CLIENT']) }}"
       class="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-4 hover:border-blue-300 transition-colors group">
        <div class="flex items-center justify-between mb-2">
            <p class="text-xs text-[#6B7280] uppercase tracking-wider">En location</p>
            <div class="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                <i class="fas fa-truck text-blue-600 group-hover:text-white"></i>
            </div>
        </div>
        <p class="text-3xl font-bold text-[#0D1F3C]">{{ $stats['en_location'] }}</p>
        <p class="text-xs text-[#94A3B8] mt-1">Chez les clients</p>
    </a>

    <a href="{{ route('blade.logistique.containers', ['statut' => 'EN_MAINTENANCE']) }}"
       class="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-4 hover:border-amber-300 transition-colors group">
        <div class="flex items-center justify-between mb-2">
            <p class="text-xs text-[#6B7280] uppercase tracking-wider">Maintenance</p>
            <div class="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center group-hover:bg-amber-500 transition-colors">
                <i class="fas fa-wrench text-amber-500 group-hover:text-white"></i>
            </div>
        </div>
        <p class="text-3xl font-bold text-[#0D1F3C]">{{ $stats['maintenance'] }}</p>
        <p class="text-xs text-[#94A3B8] mt-1">En cours de réparation</p>
    </a>
</div>

{{-- Quick links --}}
<div class="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-5">
    <h3 class="text-sm font-semibold text-[#0D1F3C] mb-4 flex items-center gap-2">
        <i class="fas fa-bolt text-[#CFA030]"></i> Accès rapides
    </h3>
    <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
        @foreach([
            ['route' => 'blade.logistique.containers',  'icon' => 'fa-boxes',          'label' => 'Parc conteneurs', 'color' => 'text-[#0D1F3C] bg-[#EDF2F7]'],
            ['route' => 'blade.logistique.movements',   'icon' => 'fa-exchange-alt',   'label' => 'Mouvements Gate', 'color' => 'text-[#1A4A8C] bg-[#EBF4FF]'],
            ['route' => 'blade.logistique.warehouse',   'icon' => 'fa-warehouse',      'label' => 'Vue entrepôt',    'color' => 'text-amber-500 bg-amber-50'],
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
