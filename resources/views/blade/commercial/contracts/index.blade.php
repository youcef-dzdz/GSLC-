@extends('layouts.gslc')
@section('page_title', 'Contrats')

@section('content')

<div class="bg-white rounded-xl border border-[#E2E8F0] shadow-sm border-l-4 border-l-[#CFA030] p-4 mb-5 flex items-center justify-between">
    <div>
        <h1 class="text-2xl font-bold text-[#0D1F3C]">Contrats d'Importation</h1>
        <p class="text-sm text-[#6B7280]">NASHCO — Service Commercial</p>
    </div>
    <img src="{{ asset('images/nashco_logo Company.jpg') }}" alt="NASHCO" class="h-12 w-auto rounded-lg">
</div>

<div class="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-4 mb-4">
    <form method="GET" action="{{ route('blade.commercial.contracts') }}" class="flex flex-wrap gap-3 items-center">
        <div class="flex-1 min-w-48">
            <input type="text" name="search" value="{{ request('search') }}"
                   placeholder="N° contrat ou raison sociale..."
                   class="w-full border border-[#CBD5E1] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4A8C] bg-white">
        </div>
        <select name="statut" class="border border-[#CBD5E1] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4A8C] bg-white">
            <option value="">Tous les statuts</option>
            @foreach(['EN_ATTENTE_SIGNATURE','SIGNE_EN_ATTENTE_CAUTION','CAUTION_RECUE_EN_VERIFICATION','ACTIF','TERMINE','ANNULE','RESILIE'] as $s)
            <option value="{{ $s }}" {{ request('statut') === $s ? 'selected' : '' }}>{{ str_replace('_',' ',$s) }}</option>
            @endforeach
        </select>
        <button type="submit" class="bg-[#0D1F3C] text-white hover:bg-[#1A4A8C] rounded-lg px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2">
            <i class="fas fa-search"></i> Filtrer
        </button>
        @if(request()->hasAny(['search','statut']))
        <a href="{{ route('blade.commercial.contracts') }}" class="text-[#1A4A8C] text-sm hover:underline"><i class="fas fa-times mr-1"></i>Réinitialiser</a>
        @endif
    </form>
</div>

<div class="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">
    <table class="w-full">
        <thead class="bg-[#0D1F3C]">
            <tr>
                <th class="text-left text-xs font-semibold text-white uppercase tracking-wider px-4 py-3">N° Contrat</th>
                <th class="text-left text-xs font-semibold text-white uppercase tracking-wider px-4 py-3">Client</th>
                <th class="text-left text-xs font-semibold text-white uppercase tracking-wider px-4 py-3">Période</th>
                <th class="text-left text-xs font-semibold text-white uppercase tracking-wider px-4 py-3">Caution</th>
                <th class="text-left text-xs font-semibold text-white uppercase tracking-wider px-4 py-3">Statut</th>
                <th class="text-right text-xs font-semibold text-white uppercase tracking-wider px-4 py-3">Actions</th>
            </tr>
        </thead>
        <tbody>
            @forelse($contracts as $contract)
            @php
                $statColor = match($contract->statut) {
                    'ACTIF'    => 'bg-emerald-50 text-emerald-700',
                    'TERMINE'  => 'bg-slate-100 text-slate-600',
                    'ANNULE','RESILIE' => 'bg-red-50 text-red-700',
                    default    => 'bg-amber-50 text-amber-700',
                };
            @endphp
            <tr class="border-b border-[#E2E8F0] hover:bg-[#EBF4FF] transition-colors">
                <td class="px-4 py-3">
                    <span class="font-mono text-xs bg-[#EDF2F7] text-[#0D1F3C] px-2 py-0.5 rounded">{{ $contract->numero_contrat }}</span>
                </td>
                <td class="px-4 py-3 text-sm font-medium text-[#0D1F3C]">{{ $contract->client?->raison_sociale }}</td>
                <td class="px-4 py-3 text-xs text-[#6B7280]">
                    {{ \Carbon\Carbon::parse($contract->date_debut)->format('d/m/Y') }}
                    → {{ \Carbon\Carbon::parse($contract->date_fin)->format('d/m/Y') }}
                </td>
                <td class="px-4 py-3 text-sm text-[#4B5563]">
                    @if($contract->montant_caution)
                    {{ number_format($contract->montant_caution, 2) }} DZD
                    @else
                    <span class="text-[#94A3B8]">—</span>
                    @endif
                </td>
                <td class="px-4 py-3">
                    <span class="inline-flex px-2 py-1 rounded-full text-xs font-medium {{ $statColor }}">
                        {{ str_replace('_', ' ', $contract->statut) }}
                    </span>
                </td>
                <td class="px-4 py-3">
                    <div class="flex items-center justify-end">
                        <a href="{{ route('blade.commercial.contracts.show', $contract->id) }}"
                           class="p-2 rounded-lg hover:bg-[#F0F4F8] text-[#475569] transition-colors">
                            <i class="fas fa-eye text-sm"></i>
                        </a>
                    </div>
                </td>
            </tr>
            @empty
            <tr>
                <td colspan="6" class="py-16 text-center">
                    <i class="fas fa-file-contract fa-4x text-[#CBD5E1] mb-3 block"></i>
                    <p class="text-[#6B7280] font-medium">Aucun contrat trouvé</p>
                </td>
            </tr>
            @endforelse
        </tbody>
    </table>
</div>

@if($contracts->hasPages())
<div class="mt-4">{{ $contracts->links() }}</div>
@endif

@endsection
