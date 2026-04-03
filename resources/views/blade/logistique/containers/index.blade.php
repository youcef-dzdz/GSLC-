@extends('layouts.gslc')
@section('page_title', 'Conteneurs')

@section('content')

<div class="bg-white rounded-xl border border-[#E2E8F0] shadow-sm border-l-4 border-l-[#CFA030] p-4 mb-5 flex items-center justify-between">
    <div>
        <h1 class="text-2xl font-bold text-[#0D1F3C]">Gestion des Conteneurs</h1>
        <p class="text-sm text-[#6B7280]">NASHCO — Service Logistique</p>
    </div>
    <img src="{{ asset('images/nashco_logo Company.jpg') }}" alt="NASHCO" class="h-12 w-auto rounded-lg">
</div>

<div class="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-4 mb-4">
    <form method="GET" action="{{ route('blade.logistique.containers') }}" class="flex flex-wrap gap-3 items-center">
        <div class="flex-1 min-w-48">
            <input type="text" name="search" value="{{ request('search') }}"
                   placeholder="Rechercher par numéro ou propriétaire..."
                   class="w-full border border-[#CBD5E1] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4A8C] bg-white">
        </div>
        <select name="statut" class="border border-[#CBD5E1] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4A8C] bg-white">
            <option value="">Tous les statuts</option>
            @foreach(['DISPONIBLE','RESERVE','AU_PORT','AU_DEPOT','LIVRAISON_CLIENT','EN_MAINTENANCE','RETOURNE_VIDE'] as $s)
            <option value="{{ $s }}" {{ request('statut') === $s ? 'selected' : '' }}>{{ str_replace('_',' ',$s) }}</option>
            @endforeach
        </select>
        <select name="etat_actuel" class="border border-[#CBD5E1] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4A8C] bg-white">
            <option value="">Tous les états</option>
            <option value="BON_ETAT" {{ request('etat_actuel') === 'BON_ETAT' ? 'selected' : '' }}>Bon état</option>
            <option value="ENDOMMAGE" {{ request('etat_actuel') === 'ENDOMMAGE' ? 'selected' : '' }}>Endommagé</option>
            <option value="EN_REPARATION" {{ request('etat_actuel') === 'EN_REPARATION' ? 'selected' : '' }}>En réparation</option>
        </select>
        <button type="submit" class="bg-[#0D1F3C] text-white hover:bg-[#1A4A8C] rounded-lg px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2">
            <i class="fas fa-search"></i> Filtrer
        </button>
        @if(request()->hasAny(['search','statut','etat_actuel']))
        <a href="{{ route('blade.logistique.containers') }}" class="text-[#1A4A8C] text-sm hover:underline"><i class="fas fa-times mr-1"></i>Réinitialiser</a>
        @endif
    </form>
</div>

<div class="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">
    <table class="w-full">
        <thead class="bg-[#0D1F3C]">
            <tr>
                <th class="text-left text-xs font-semibold text-white uppercase tracking-wider px-4 py-3">Numéro</th>
                <th class="text-left text-xs font-semibold text-white uppercase tracking-wider px-4 py-3">Type</th>
                <th class="text-left text-xs font-semibold text-white uppercase tracking-wider px-4 py-3">Propriétaire</th>
                <th class="text-left text-xs font-semibold text-white uppercase tracking-wider px-4 py-3">État</th>
                <th class="text-left text-xs font-semibold text-white uppercase tracking-wider px-4 py-3">Statut</th>
                <th class="text-right text-xs font-semibold text-white uppercase tracking-wider px-4 py-3">Actions</th>
            </tr>
        </thead>
        <tbody>
            @forelse($containers as $container)
            @php
                $statutColor = match($container->statut) {
                    'DISPONIBLE'       => 'bg-emerald-50 text-emerald-700',
                    'RESERVE'          => 'bg-amber-50 text-amber-700',
                    'AU_PORT','AU_DEPOT'=> 'bg-blue-50 text-blue-700',
                    'LIVRAISON_CLIENT' => 'bg-purple-50 text-purple-700',
                    'EN_MAINTENANCE'   => 'bg-red-50 text-red-700',
                    'RETOURNE_VIDE'    => 'bg-slate-100 text-slate-600',
                    default            => 'bg-slate-100 text-slate-600',
                };
            @endphp
            <tr class="border-b border-[#E2E8F0] hover:bg-[#EBF4FF] transition-colors">
                <td class="px-4 py-3">
                    <div class="flex items-center gap-3">
                        <div class="w-9 h-9 rounded-lg bg-slate-50 flex items-center justify-center flex-shrink-0">
                            <i class="fas fa-box text-[#475569] text-sm"></i>
                        </div>
                        <span class="font-mono text-sm font-semibold text-[#0D1F3C]">{{ $container->numero_conteneur }}</span>
                    </div>
                </td>
                <td class="px-4 py-3 text-sm text-[#4B5563]">{{ $container->type?->code_type ?? '—' }}</td>
                <td class="px-4 py-3 text-sm text-[#4B5563]">{{ $container->proprietaire }}</td>
                <td class="px-4 py-3">
                    <span class="text-xs {{ $container->etat_actuel === 'BON_ETAT' ? 'text-emerald-600' : 'text-red-600' }} font-medium">
                        {{ str_replace('_',' ', $container->etat_actuel) }}
                    </span>
                </td>
                <td class="px-4 py-3">
                    <span class="inline-flex px-2 py-1 rounded-full text-xs font-medium {{ $statutColor }}">
                        {{ str_replace('_',' ', $container->statut) }}
                    </span>
                </td>
                <td class="px-4 py-3">
                    <div class="flex items-center justify-end gap-1">
                        <a href="{{ route('blade.logistique.containers.show', $container->id) }}"
                           class="p-2 rounded-lg hover:bg-[#F0F4F8] text-[#475569] transition-colors" title="Voir détail">
                            <i class="fas fa-eye text-sm"></i>
                        </a>
                    </div>
                </td>
            </tr>
            @empty
            <tr>
                <td colspan="6" class="py-16 text-center">
                    <i class="fas fa-box fa-4x text-[#CBD5E1] mb-3 block"></i>
                    <p class="text-[#6B7280] font-medium">Aucun conteneur trouvé</p>
                </td>
            </tr>
            @endforelse
        </tbody>
    </table>
</div>

@if($containers->hasPages())
<div class="mt-4">{{ $containers->links() }}</div>
@endif

@endsection
