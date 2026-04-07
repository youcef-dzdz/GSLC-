@extends('layouts.gslc')
@section('page_title', $t('Mes Factures'))

@section('content')

<div class="bg-white rounded-xl border border-[#E2E8F0] shadow-sm border-l-4 border-l-[#CFA030] p-4 mb-5 flex items-center justify-between">
    <div>
        <h1 class="text-2xl font-bold text-[#0D1F3C]">{{ $t('Mes Factures') }}</h1>
        <p class="text-sm text-[#6B7280]">{{ $t('Portail client NASHCO') }} — {{ $t('Historique et téléchargement de vos factures') }}</p>
    </div>
    <img src="{{ asset('images/nashco_logo Company.jpg') }}" alt="NASHCO" class="h-12 w-auto rounded-lg">
</div>

@if(session('success'))
<div class="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 mb-4 flex items-center gap-3">
    <i class="fas fa-check-circle text-emerald-500 flex-shrink-0"></i>
    <span class="text-sm text-emerald-700">{{ session('success') }}</span>
</div>
@endif

<div class="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-x-auto">
    <table class="w-full min-w-[800px]">
        <thead class="bg-[#0D1F3C]">
            <tr>
                <th class="text-left text-xs font-semibold text-white uppercase tracking-wider px-4 py-3">{{ $t('N° Facture') }}</th>
                <th class="text-left text-xs font-semibold text-white uppercase tracking-wider px-4 py-3">{{ $t('Émission') }}</th>
                <th class="text-left text-xs font-semibold text-white uppercase tracking-wider px-4 py-3">{{ $t('Échéance') }}</th>
                <th class="text-right text-xs font-semibold text-white uppercase tracking-wider px-4 py-3">{{ $t('Montant HT') }}</th>
                <th class="text-right text-xs font-semibold text-white uppercase tracking-wider px-4 py-3">{{ $t('TVA 19%') }}</th>
                <th class="text-right text-xs font-semibold text-white uppercase tracking-wider px-4 py-3">{{ $t('Montant TTC') }}</th>
                <th class="text-left text-xs font-semibold text-white uppercase tracking-wider px-4 py-3">{{ $t('Statut') }}</th>
                <th class="text-right text-xs font-semibold text-white uppercase tracking-wider px-4 py-3">PDF</th>
            </tr>
        </thead>
        <tbody>
            @forelse($invoices as $invoice)
            @php
                $tvaAmount = $invoice->montant_ttc - $invoice->montant_ht;
                $isOverdue  = $invoice->date_echeance && $invoice->date_echeance->isPast()
                              && !in_array($invoice->statut, ['PAYEE', 'ANNULEE']);

                $badge = match(true) {
                    $isOverdue                       => 'bg-red-50 text-red-600',
                    $invoice->statut === 'PAYEE'     => 'bg-emerald-50 text-emerald-700',
                    $invoice->statut === 'EMISE'     => 'bg-blue-50 text-blue-700',
                    $invoice->statut === 'BROUILLON' => 'bg-slate-100 text-slate-600',
                    $invoice->statut === 'ANNULEE'   => 'bg-slate-100 text-slate-500',
                    default                          => 'bg-slate-100 text-slate-600',
                };
                $label = match(true) {
                    $isOverdue                       => $t('En retard'),
                    $invoice->statut === 'PAYEE'     => $t('Payée'),
                    $invoice->statut === 'EMISE'     => $t('Émise'),
                    $invoice->statut === 'BROUILLON' => $t('Brouillon'),
                    $invoice->statut === 'ANNULEE'   => $t('Annulée'),
                    default                          => str_replace('_', ' ', $invoice->statut),
                };
            @endphp
            <tr class="border-b border-[#E2E8F0] hover:bg-[#EBF4FF] transition-colors {{ $isOverdue ? 'bg-red-50/30' : '' }}">
                <td class="px-4 py-3 font-mono text-sm font-semibold text-[#0D1F3C]">{{ $invoice->numero_facture }}</td>
                <td class="px-4 py-3 text-sm text-[#6B7280]">
                    {{ $invoice->date_emission ? $invoice->date_emission->format('d/m/Y') : '—' }}
                </td>
                <td class="px-4 py-3 text-sm {{ $isOverdue ? 'text-red-600 font-semibold' : 'text-[#6B7280]' }}">
                    {{ $invoice->date_echeance ? $invoice->date_echeance->format('d/m/Y') : '—' }}
                    @if($isOverdue)
                        <span class="ml-1 text-xs text-red-500"><i class="fas fa-exclamation-triangle"></i></span>
                    @endif
                </td>
                <td class="px-4 py-3 text-sm text-right text-[#4B5563]">
                    {{ number_format($invoice->montant_ht, 0, ',', ' ') }}
                    <span class="text-[#94A3B8] text-xs">DZD</span>
                </td>
                <td class="px-4 py-3 text-sm text-right text-[#4B5563]">
                    {{ number_format($tvaAmount, 0, ',', ' ') }}
                    <span class="text-[#94A3B8] text-xs">DZD</span>
                </td>
                <td class="px-4 py-3 text-sm font-semibold text-right text-[#0D1F3C]">
                    {{ number_format($invoice->montant_ttc, 0, ',', ' ') }}
                    <span class="text-[#94A3B8] font-normal text-xs">DZD</span>
                </td>
                <td class="px-4 py-3">
                    <span class="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold {{ $badge }}">{{ $label }}</span>
                </td>
                <td class="px-4 py-3 text-right">
                    @if($invoice->statut !== 'BROUILLON')
                    <a href="{{ route('client.invoices.pdf', $invoice->id) }}" target="_blank"
                       class="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 text-xs font-medium transition-colors"
                       title="PDF">
                        <i class="fas fa-file-pdf text-xs"></i> PDF
                    </a>
                    @else
                    <span class="text-xs text-[#CBD5E1]">—</span>
                    @endif
                </td>
            </tr>
            @empty
            <tr>
                <td colspan="8" class="py-16 text-center">
                    <i class="fas fa-file-invoice fa-4x text-[#CBD5E1] mb-3 block"></i>
                    <p class="text-[#6B7280] font-medium">{{ $t('Aucun élément à afficher pour le moment.') }}</p>
                    <p class="text-sm text-[#94A3B8] mt-1">{{ $t('Vos factures apparaîtront ici une fois générées par notre équipe financière.') }}</p>
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
