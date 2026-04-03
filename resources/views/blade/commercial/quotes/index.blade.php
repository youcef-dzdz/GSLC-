@extends('layouts.gslc')
@section('page_title', 'Devis')

@section('content')

<div class="bg-white rounded-xl border border-[#E2E8F0] shadow-sm border-l-4 border-l-[#CFA030] p-4 mb-5 flex items-center justify-between">
    <div>
        <h1 class="text-2xl font-bold text-[#0D1F3C]">Gestion des Devis</h1>
        <p class="text-sm text-[#6B7280]">NASHCO — Service Commercial</p>
    </div>
    <div class="flex items-center gap-3">
        <a href="{{ route('blade.commercial.quotes.create') }}"
           class="bg-[#CFA030] hover:bg-[#b8881f] text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2">
            <i class="fas fa-plus"></i> Nouveau devis
        </a>
        <img src="{{ asset('images/nashco_logo Company.jpg') }}" alt="NASHCO" class="h-12 w-auto rounded-lg">
    </div>
</div>

<div class="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-4 mb-4">
    <form method="GET" action="{{ route('blade.commercial.quotes') }}" class="flex flex-wrap gap-3 items-center">
        <div class="flex-1 min-w-48">
            <input type="text" name="search" value="{{ request('search') }}"
                   placeholder="N° devis ou raison sociale..."
                   class="w-full border border-[#CBD5E1] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4A8C] bg-white">
        </div>
        <select name="statut" class="border border-[#CBD5E1] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4A8C] bg-white">
            <option value="">Tous les statuts</option>
            @foreach(['BROUILLON','ENVOYE','EN_NEGOCIATION','ACCEPTE','REFUSE','EXPIRE'] as $s)
            <option value="{{ $s }}" {{ request('statut') === $s ? 'selected' : '' }}>{{ str_replace('_',' ',$s) }}</option>
            @endforeach
        </select>
        <button type="submit" class="bg-[#0D1F3C] text-white hover:bg-[#1A4A8C] rounded-lg px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2">
            <i class="fas fa-search"></i> Filtrer
        </button>
        @if(request()->hasAny(['search','statut']))
        <a href="{{ route('blade.commercial.quotes') }}" class="text-[#1A4A8C] text-sm hover:underline"><i class="fas fa-times mr-1"></i>Réinitialiser</a>
        @endif
    </form>
</div>

<div class="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">
    <table class="w-full">
        <thead class="bg-[#0D1F3C]">
            <tr>
                <th class="text-left text-xs font-semibold text-white uppercase tracking-wider px-4 py-3">N° Devis</th>
                <th class="text-left text-xs font-semibold text-white uppercase tracking-wider px-4 py-3">Client</th>
                <th class="text-left text-xs font-semibold text-white uppercase tracking-wider px-4 py-3">Version</th>
                <th class="text-left text-xs font-semibold text-white uppercase tracking-wider px-4 py-3">Total TTC</th>
                <th class="text-left text-xs font-semibold text-white uppercase tracking-wider px-4 py-3">Expiration</th>
                <th class="text-left text-xs font-semibold text-white uppercase tracking-wider px-4 py-3">Statut</th>
                <th class="text-right text-xs font-semibold text-white uppercase tracking-wider px-4 py-3">Actions</th>
            </tr>
        </thead>
        <tbody>
            @forelse($quotes as $quote)
            @php
                $statColor = match($quote->statut) {
                    'ACCEPTE'       => 'bg-emerald-50 text-emerald-700',
                    'REFUSE','EXPIRE'=> 'bg-red-50 text-red-700',
                    'ENVOYE'        => 'bg-blue-50 text-blue-700',
                    'EN_NEGOCIATION'=> 'bg-amber-50 text-amber-700',
                    default         => 'bg-slate-100 text-slate-600',
                };
            @endphp
            <tr class="border-b border-[#E2E8F0] hover:bg-[#EBF4FF] transition-colors">
                <td class="px-4 py-3">
                    <span class="font-mono text-xs bg-[#EDF2F7] text-[#0D1F3C] px-2 py-0.5 rounded">{{ $quote->numero_devis }}</span>
                </td>
                <td class="px-4 py-3 text-sm font-medium text-[#0D1F3C]">{{ $quote->demande?->client?->raison_sociale }}</td>
                <td class="px-4 py-3 text-sm text-[#4B5563]">v{{ $quote->version }}</td>
                <td class="px-4 py-3 text-sm font-semibold text-[#0D1F3C]">{{ number_format($quote->total_ttc, 2) }} DZD</td>
                <td class="px-4 py-3 text-xs text-[#6B7280]">
                    {{ $quote->date_expiration ? \Carbon\Carbon::parse($quote->date_expiration)->format('d/m/Y') : '—' }}
                </td>
                <td class="px-4 py-3">
                    <span class="inline-flex px-2 py-1 rounded-full text-xs font-medium {{ $statColor }}">
                        {{ str_replace('_', ' ', $quote->statut) }}
                    </span>
                </td>
                <td class="px-4 py-3">
                    <div class="flex items-center justify-end">
                        <a href="{{ route('blade.commercial.quotes.show', $quote->id) }}"
                           class="p-2 rounded-lg hover:bg-[#F0F4F8] text-[#475569] transition-colors">
                            <i class="fas fa-eye text-sm"></i>
                        </a>
                    </div>
                </td>
            </tr>
            @empty
            <tr>
                <td colspan="7" class="py-16 text-center">
                    <i class="fas fa-file-invoice fa-4x text-[#CBD5E1] mb-3 block"></i>
                    <p class="text-[#6B7280] font-medium">Aucun devis trouvé</p>
                </td>
            </tr>
            @endforelse
        </tbody>
    </table>
</div>

@if($quotes->hasPages())
<div class="mt-4">{{ $quotes->links() }}</div>
@endif

@endsection
