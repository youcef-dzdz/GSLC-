@extends('layouts.gslc')
@section('page_title', 'Factures')

@section('content')

<div class="bg-white rounded-xl border border-[#E2E8F0] shadow-sm border-l-4 border-l-[#CFA030] p-4 mb-5 flex items-center justify-between">
    <div>
        <h1 class="text-2xl font-bold text-[#0D1F3C]">Gestion des Factures</h1>
        <p class="text-sm text-[#6B7280]">NASHCO — Service Financier</p>
    </div>
    <img src="{{ asset('images/nashco_logo Company.jpg') }}" alt="NASHCO" class="h-12 w-auto rounded-lg">
</div>

<div class="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-4 mb-4">
    <form method="GET" action="{{ route('blade.finance.invoices') }}" class="flex flex-wrap gap-3 items-center">
        <div class="flex-1 min-w-48">
            <input type="text" name="search" value="{{ request('search') }}"
                   placeholder="N° facture ou raison sociale..."
                   class="w-full border border-[#CBD5E1] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4A8C] bg-white">
        </div>
        <select name="statut" class="border border-[#CBD5E1] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4A8C] bg-white">
            <option value="">Tous les statuts</option>
            @foreach(['EMISE','ENVOYEE','PARTIELLEMENT_PAYEE','PAYEE','LITIGE','ANNULEE'] as $s)
            <option value="{{ $s }}" {{ request('statut') === $s ? 'selected' : '' }}>{{ str_replace('_',' ',$s) }}</option>
            @endforeach
        </select>
        <select name="type_facture" class="border border-[#CBD5E1] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4A8C] bg-white">
            <option value="">Tous les types</option>
            <option value="STANDARD" {{ request('type_facture') === 'STANDARD' ? 'selected' : '' }}>Standard</option>
            <option value="PENALITE" {{ request('type_facture') === 'PENALITE' ? 'selected' : '' }}>Pénalité</option>
            <option value="AVOIR"    {{ request('type_facture') === 'AVOIR' ? 'selected' : '' }}>Avoir</option>
        </select>
        <button type="submit" class="bg-[#0D1F3C] text-white hover:bg-[#1A4A8C] rounded-lg px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2">
            <i class="fas fa-search"></i> Filtrer
        </button>
        @if(request()->hasAny(['search','statut','type_facture']))
        <a href="{{ route('blade.finance.invoices') }}" class="text-[#1A4A8C] text-sm hover:underline"><i class="fas fa-times mr-1"></i>Réinitialiser</a>
        @endif
    </form>
</div>

<div class="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">
    <table class="w-full">
        <thead class="bg-[#0D1F3C]">
            <tr>
                <th class="text-left text-xs font-semibold text-white uppercase tracking-wider px-4 py-3">N° Facture</th>
                <th class="text-left text-xs font-semibold text-white uppercase tracking-wider px-4 py-3">Client</th>
                <th class="text-left text-xs font-semibold text-white uppercase tracking-wider px-4 py-3">Type</th>
                <th class="text-left text-xs font-semibold text-white uppercase tracking-wider px-4 py-3">Total TTC</th>
                <th class="text-left text-xs font-semibold text-white uppercase tracking-wider px-4 py-3">Restant</th>
                <th class="text-left text-xs font-semibold text-white uppercase tracking-wider px-4 py-3">Échéance</th>
                <th class="text-left text-xs font-semibold text-white uppercase tracking-wider px-4 py-3">Statut</th>
                <th class="text-right text-xs font-semibold text-white uppercase tracking-wider px-4 py-3">Actions</th>
            </tr>
        </thead>
        <tbody>
            @forelse($invoices as $invoice)
            @php
                $statColor = match($invoice->statut) {
                    'PAYEE'              => 'bg-emerald-50 text-emerald-700',
                    'EMISE','ENVOYEE'    => 'bg-blue-50 text-blue-700',
                    'PARTIELLEMENT_PAYEE'=> 'bg-amber-50 text-amber-700',
                    'LITIGE'             => 'bg-orange-50 text-orange-700',
                    'ANNULEE'            => 'bg-red-50 text-red-700',
                    default              => 'bg-slate-100 text-slate-600',
                };
                $isOverdue = !in_array($invoice->statut, ['PAYEE','ANNULEE']) && now()->gt($invoice->date_echeance);
            @endphp
            <tr class="border-b border-[#E2E8F0] hover:bg-[#EBF4FF] transition-colors">
                <td class="px-4 py-3">
                    <span class="font-mono text-xs bg-[#EDF2F7] text-[#0D1F3C] px-2 py-0.5 rounded">{{ $invoice->numero_facture }}</span>
                </td>
                <td class="px-4 py-3 text-sm font-medium text-[#0D1F3C]">{{ $invoice->client?->raison_sociale }}</td>
                <td class="px-4 py-3 text-xs text-[#6B7280]">{{ $invoice->type_facture }}</td>
                <td class="px-4 py-3 text-sm font-semibold text-[#0D1F3C]">{{ number_format($invoice->montant_ttc, 2) }}</td>
                <td class="px-4 py-3 text-sm {{ $invoice->montant_restant > 0 ? 'text-red-600 font-semibold' : 'text-emerald-600' }}">
                    {{ number_format($invoice->montant_restant, 2) }}
                </td>
                <td class="px-4 py-3 text-xs {{ $isOverdue ? 'text-red-600 font-semibold' : 'text-[#6B7280]' }}">
                    {{ $invoice->date_echeance->format('d/m/Y') }}
                    @if($isOverdue) <span class="ml-1">⚠</span> @endif
                </td>
                <td class="px-4 py-3">
                    <span class="inline-flex px-2 py-1 rounded-full text-xs font-medium {{ $statColor }}">
                        {{ str_replace('_', ' ', $invoice->statut) }}
                    </span>
                </td>
                <td class="px-4 py-3">
                    <div class="flex items-center justify-end gap-1">
                        <a href="{{ route('blade.finance.invoices.show', $invoice->id) }}"
                           class="p-2 rounded-lg hover:bg-[#F0F4F8] text-[#475569] transition-colors" title="Voir">
                            <i class="fas fa-eye text-sm"></i>
                        </a>
                        <a href="{{ route('blade.finance.invoices.pdf', $invoice->id) }}"
                           class="p-2 rounded-lg hover:bg-[#F0F4F8] text-[#475569] transition-colors" title="PDF" target="_blank">
                            <i class="fas fa-file-pdf text-sm"></i>
                        </a>
                        @if(auth()->user()->hasPermission('invoices.emit') && in_array($invoice->statut, ['EMISE']))
                        <form action="{{ route('blade.finance.invoices.emit', $invoice->id) }}" method="POST"
                              onsubmit="return confirm('Émettre cette facture au client ?')">
                            @csrf
                            <button type="submit" class="p-2 rounded-lg hover:bg-emerald-50 text-emerald-600 transition-colors" title="Émettre">
                                <i class="fas fa-paper-plane text-sm"></i>
                            </button>
                        </form>
                        @endif
                    </div>
                </td>
            </tr>
            @empty
            <tr>
                <td colspan="8" class="py-16 text-center">
                    <i class="fas fa-file-invoice-dollar fa-4x text-[#CBD5E1] mb-3 block"></i>
                    <p class="text-[#6B7280] font-medium">Aucune facture trouvée</p>
                </td>
            </tr>
            @endforelse
        </tbody>
    </table>
</div>

@if($invoices->hasPages())
<div class="mt-4">{{ $invoices->links() }}</div>
@endif

@endsection
