@extends('layouts.gslc')
@section('page_title', 'Vue Entrepôt')

@section('content')

<div class="bg-white rounded-xl border border-[#E2E8F0] shadow-sm border-l-4 border-l-[#CFA030] p-4 mb-5 flex items-center justify-between">
    <div>
        <h1 class="text-2xl font-bold text-[#0D1F3C]">Vue Entrepôt</h1>
        <p class="text-sm text-[#6B7280]">NASHCO — Dépôt Port de Mostaganem — Au dépôt & Disponibles</p>
    </div>
    <div class="flex items-center gap-3">
        <a href="{{ route('blade.logistique.containers') }}"
           class="bg-white border border-[#CBD5E1] text-[#0D1F3C] hover:bg-[#F0F4F8] rounded-lg px-3 py-2 text-sm transition-colors flex items-center gap-2">
            <i class="fas fa-list text-[#CFA030]"></i> Vue liste
        </a>
        <img src="{{ asset('images/nashco_logo Company.jpg') }}" alt="NASHCO" class="h-12 w-auto rounded-lg">
    </div>
</div>

@php
    $statusConfig = [
        'AU_DEPOT'   => 'bg-[#EBF4FF] text-[#1A4A8C] border-[#BFDBFE]',
        'DISPONIBLE' => 'bg-emerald-50 text-emerald-700 border-emerald-200',
    ];
@endphp

@if($containers->isEmpty())
<div class="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-16 text-center">
    <i class="fas fa-warehouse fa-4x text-[#CBD5E1] mb-3 block"></i>
    <p class="text-[#6B7280] font-medium">Aucun conteneur au dépôt</p>
</div>
@else
<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
    @foreach($containers as $container)
    @php $classes = $statusConfig[$container->statut] ?? 'bg-[#EDF2F7] text-[#475569] border-[#CBD5E1]'; @endphp
    <a href="{{ route('blade.logistique.containers.show', $container->id) }}"
       class="border rounded-xl p-3 text-center hover:shadow-md hover:border-[#CFA030] transition-all {{ $classes }}">
        <div class="w-10 h-10 mx-auto mb-2 rounded-lg bg-white/60 flex items-center justify-center">
            <i class="fas fa-box text-sm"></i>
        </div>
        <p class="font-mono text-xs font-bold leading-tight break-all">{{ $container->numero_conteneur }}</p>
        <p class="text-xs mt-1 opacity-75">{{ $container->type?->code_type ?? '—' }}</p>
        <p class="text-xs mt-1 font-medium">
            {{ $container->statut === 'AU_DEPOT' ? 'Au dépôt' : 'Disponible' }}
        </p>
    </a>
    @endforeach
</div>

@if($containers->hasPages())
<div class="mt-4">{{ $containers->links() }}</div>
@endif
@endif

@endsection
