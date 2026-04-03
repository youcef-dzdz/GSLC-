@extends('layouts.gslc')
@section('page_title', 'Mes demandes')

@section('content')

<div class="bg-white rounded-xl border border-[#E2E8F0] shadow-sm border-l-4 border-l-[#CFA030] p-4 mb-5 flex items-center justify-between">
    <div>
        <h1 class="text-2xl font-bold text-[#0D1F3C]">Mes demandes d'importation</h1>
        <p class="text-sm text-[#6B7280]">Portail client NASHCO</p>
    </div>
    <div class="flex items-center gap-3">
        <a href="{{ route('client.demands.create') }}"
           class="bg-[#CFA030] hover:bg-[#b8881f] text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2">
            <i class="fas fa-plus"></i> Nouvelle demande
        </a>
        <img src="{{ asset('images/nashco_logo Company.jpg') }}" alt="NASHCO" class="h-12 w-auto rounded-lg">
    </div>
</div>

<div class="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-4 mb-4">
    <form method="GET" action="{{ route('client.demands') }}" class="flex flex-wrap gap-3 items-center">
        <div class="flex-1 min-w-48">
            <input type="text" name="search" value="{{ request('search') }}"
                   placeholder="N° dossier..."
                   class="w-full border border-[#CBD5E1] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4A8C] bg-white">
        </div>
        <select name="statut" class="border border-[#CBD5E1] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4A8C] bg-white">
            <option value="">Tous les statuts</option>
            @foreach(['SOUMISE','EN_COURS','TRAITEE','ANNULEE'] as $s)
            <option value="{{ $s }}" {{ request('statut') === $s ? 'selected' : '' }}>{{ str_replace('_', ' ', $s) }}</option>
            @endforeach
        </select>
        <button type="submit" class="bg-[#0D1F3C] text-white hover:bg-[#1A4A8C] rounded-lg px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2">
            <i class="fas fa-search"></i> Filtrer
        </button>
        @if(request()->hasAny(['search','statut']))
        <a href="{{ route('client.demands') }}" class="text-[#1A4A8C] text-sm hover:underline"><i class="fas fa-times mr-1"></i>Réinitialiser</a>
        @endif
    </form>
</div>

<div class="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">
    <table class="w-full">
        <thead class="bg-[#0D1F3C]">
            <tr>
                <th class="text-left text-xs font-semibold text-white uppercase tracking-wider px-4 py-3">N° Dossier</th>
                <th class="text-left text-xs font-semibold text-white uppercase tracking-wider px-4 py-3">Type</th>
                <th class="text-left text-xs font-semibold text-white uppercase tracking-wider px-4 py-3">Priorité</th>
                <th class="text-left text-xs font-semibold text-white uppercase tracking-wider px-4 py-3">Soumis le</th>
                <th class="text-left text-xs font-semibold text-white uppercase tracking-wider px-4 py-3">Statut</th>
                <th class="text-right text-xs font-semibold text-white uppercase tracking-wider px-4 py-3">Détail</th>
            </tr>
        </thead>
        <tbody>
            @forelse($demands as $demand)
            @php
                $statusColor = match($demand->statut) {
                    'SOUMISE'  => 'bg-amber-50 text-amber-700',
                    'EN_COURS' => 'bg-blue-50 text-blue-700',
                    'TRAITEE'  => 'bg-emerald-50 text-emerald-700',
                    'ANNULEE'  => 'bg-red-50 text-red-700',
                    default    => 'bg-slate-100 text-slate-600',
                };
            @endphp
            <tr class="border-b border-[#E2E8F0] hover:bg-[#EBF4FF] transition-colors">
                <td class="px-4 py-3 font-mono text-sm font-semibold text-[#0D1F3C]">{{ $demand->numero_dossier }}</td>
                <td class="px-4 py-3 text-sm text-[#4B5563]">{{ $demand->type_achat }}</td>
                <td class="px-4 py-3">
                    @if($demand->priorite === 'URGENTE')
                    <span class="inline-flex px-2 py-0.5 rounded-full text-xs font-bold bg-red-50 text-red-600">URGENTE</span>
                    @else
                    <span class="text-xs text-[#6B7280]">Normale</span>
                    @endif
                </td>
                <td class="px-4 py-3 text-sm text-[#6B7280]">{{ $demand->created_at->format('d/m/Y') }}</td>
                <td class="px-4 py-3">
                    <span class="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold {{ $statusColor }}">
                        {{ str_replace('_', ' ', $demand->statut) }}
                    </span>
                </td>
                <td class="px-4 py-3 text-right">
                    <a href="{{ route('client.demands.show', $demand->id) }}"
                       class="p-2 rounded-lg hover:bg-[#F0F4F8] text-[#475569] inline-flex transition-colors" title="Voir">
                        <i class="fas fa-eye text-sm"></i>
                    </a>
                </td>
            </tr>
            @empty
            <tr>
                <td colspan="6" class="py-16 text-center">
                    <i class="fas fa-inbox fa-4x text-[#CBD5E1] mb-3 block"></i>
                    <p class="text-[#6B7280] font-medium">Aucune demande soumise</p>
                    <a href="{{ route('client.demands.create') }}" class="mt-3 inline-flex items-center gap-2 bg-[#CFA030] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#b8881f] transition-colors">
                        <i class="fas fa-plus"></i> Soumettre une demande
                    </a>
                </td>
            </tr>
            @endforelse
        </tbody>
    </table>
</div>

@if($demands->hasPages())
<div class="mt-4">{{ $demands->links() }}</div>
@endif

@endsection
