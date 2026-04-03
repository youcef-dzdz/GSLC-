@extends('layouts.gslc')
@section('page_title', 'Paiements')

@section('content')

<div class="bg-white rounded-xl border border-[#E2E8F0] shadow-sm border-l-4 border-l-[#CFA030] p-4 mb-5 flex items-center justify-between">
    <div>
        <h1 class="text-2xl font-bold text-[#0D1F3C]">Paiements reçus</h1>
        <p class="text-sm text-[#6B7280]">NASHCO — Suivi des encaissements</p>
    </div>
    <img src="{{ asset('images/nashco_logo Company.jpg') }}" alt="NASHCO" class="h-12 w-auto rounded-lg">
</div>

<div class="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-4 mb-4">
    <form method="GET" action="{{ route('blade.finance.payments') }}" class="flex flex-wrap gap-3 items-center">
        <div class="flex-1 min-w-48">
            <input type="text" name="search" value="{{ request('search') }}"
                   placeholder="N° facture ou raison sociale..."
                   class="w-full border border-[#CBD5E1] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4A8C] bg-white">
        </div>
        <input type="date" name="date_from" value="{{ request('date_from') }}"
               class="border border-[#CBD5E1] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4A8C] bg-white">
        <input type="date" name="date_to" value="{{ request('date_to') }}"
               class="border border-[#CBD5E1] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4A8C] bg-white">
        <button type="submit" class="bg-[#0D1F3C] text-white hover:bg-[#1A4A8C] rounded-lg px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2">
            <i class="fas fa-search"></i> Filtrer
        </button>
        @if(request()->hasAny(['search','date_from','date_to']))
        <a href="{{ route('blade.finance.payments') }}" class="text-[#1A4A8C] text-sm hover:underline"><i class="fas fa-times mr-1"></i>Réinitialiser</a>
        @endif
    </form>
</div>

<div class="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">
    <table class="w-full">
        <thead class="bg-[#0D1F3C]">
            <tr>
                <th class="text-left text-xs font-semibold text-white uppercase tracking-wider px-4 py-3">Date</th>
                <th class="text-left text-xs font-semibold text-white uppercase tracking-wider px-4 py-3">Facture</th>
                <th class="text-left text-xs font-semibold text-white uppercase tracking-wider px-4 py-3">Client</th>
                <th class="text-left text-xs font-semibold text-white uppercase tracking-wider px-4 py-3">Mode</th>
                <th class="text-left text-xs font-semibold text-white uppercase tracking-wider px-4 py-3">Référence</th>
                <th class="text-right text-xs font-semibold text-white uppercase tracking-wider px-4 py-3">Montant</th>
            </tr>
        </thead>
        <tbody>
            @forelse($payments as $payment)
            <tr class="border-b border-[#E2E8F0] hover:bg-[#EBF4FF] transition-colors">
                <td class="px-4 py-3 text-xs text-[#6B7280]">{{ $payment->created_at->format('d/m/Y H:i') }}</td>
                <td class="px-4 py-3">
                    @if($payment->facture)
                    <a href="{{ route('blade.finance.invoices.show', $payment->facture->id) }}"
                       class="font-mono text-xs text-[#1A4A8C] hover:underline font-semibold">
                        {{ $payment->facture->numero_facture }}
                    </a>
                    @else
                    <span class="text-[#94A3B8] text-xs">—</span>
                    @endif
                </td>
                <td class="px-4 py-3 text-sm text-[#4B5563]">{{ $payment->facture?->client?->raison_sociale ?? '—' }}</td>
                <td class="px-4 py-3">
                    <span class="text-xs bg-[#EDF2F7] text-[#475569] px-2 py-0.5 rounded font-medium">
                        {{ $payment->mode_paiement ?? '—' }}
                    </span>
                </td>
                <td class="px-4 py-3 font-mono text-xs text-[#6B7280]">{{ $payment->reference ?? '—' }}</td>
                <td class="px-4 py-3 text-right">
                    <span class="text-sm font-semibold text-emerald-700">
                        {{ number_format($payment->montant, 2, ',', ' ') }}
                        <span class="font-normal text-xs text-[#94A3B8]">DZD</span>
                    </span>
                </td>
            </tr>
            @empty
            <tr>
                <td colspan="6" class="py-16 text-center">
                    <i class="fas fa-credit-card fa-4x text-[#CBD5E1] mb-3 block"></i>
                    <p class="text-[#6B7280] font-medium">Aucun paiement enregistré</p>
                </td>
            </tr>
            @endforelse
        </tbody>
    </table>
</div>

@if($payments->hasPages())
<div class="mt-4">{{ $payments->links() }}</div>
@endif

@endsection
