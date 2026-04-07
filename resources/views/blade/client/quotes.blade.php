@extends('layouts.gslc')
@section('page_title', $t('Mes devis'))

@section('content')

<div class="bg-white rounded-xl border border-[#E2E8F0] shadow-sm border-l-4 border-l-[#CFA030] p-4 mb-5 flex items-center justify-between">
    <div>
        <h1 class="text-2xl font-bold text-[#0D1F3C]">{{ $t('Mes devis') }}</h1>
        <p class="text-sm text-[#6B7280]">{{ $t('Portail client NASHCO') }} — {{ $t('Consultez et gérez vos devis') }}</p>
    </div>
    <img src="{{ asset('images/nashco_logo Company.jpg') }}" alt="NASHCO" class="h-12 w-auto rounded-lg">
</div>

@if(session('success'))
<div class="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 mb-4 flex items-center gap-3">
    <i class="fas fa-check-circle text-emerald-500 flex-shrink-0"></i>
    <span class="text-sm text-emerald-700">{{ session('success') }}</span>
</div>
@endif

@if(session('error'))
<div class="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4 flex items-center gap-3">
    <i class="fas fa-exclamation-circle text-red-500 flex-shrink-0"></i>
    <span class="text-sm text-red-700">{{ session('error') }}</span>
</div>
@endif

<div class="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">
    <table class="w-full">
        <thead class="bg-[#0D1F3C]">
            <tr>
                <th class="text-left text-xs font-semibold text-white uppercase tracking-wider px-4 py-3">{{ $t('Référence') }}</th>
                <th class="text-left text-xs font-semibold text-white uppercase tracking-wider px-4 py-3">{{ $t('Date') }}</th>
                <th class="text-left text-xs font-semibold text-white uppercase tracking-wider px-4 py-3">{{ $t('Conteneurs') }}</th>
                <th class="text-right text-xs font-semibold text-white uppercase tracking-wider px-4 py-3">{{ $t('Montant TTC') }}</th>
                <th class="text-left text-xs font-semibold text-white uppercase tracking-wider px-4 py-3">{{ $t('Statut') }}</th>
                <th class="text-right text-xs font-semibold text-white uppercase tracking-wider px-4 py-3">{{ $t('Actions') }}</th>
            </tr>
        </thead>
        <tbody>
            @forelse($quotes as $quote)
            @php
                $badge = match($quote->statut) {
                    'ENVOYE'         => 'bg-amber-50 text-amber-700',
                    'EN_NEGOCIATION' => 'bg-amber-50 text-amber-700',
                    'ACCEPTE'        => 'bg-emerald-50 text-emerald-700',
                    'REFUSE'         => 'bg-red-50 text-red-600',
                    'MODIFIE'        => 'bg-blue-50 text-blue-700',
                    'EXPIRE'         => 'bg-orange-50 text-orange-600',
                    default          => 'bg-slate-100 text-slate-600',
                };
                $label = match($quote->statut) {
                    'ENVOYE'         => $t('En attente'),
                    'EN_NEGOCIATION' => $t('En négociation'),
                    'ACCEPTE'        => $t('Accepté'),
                    'REFUSE'         => $t('Refusé'),
                    'MODIFIE'        => $t('Modifié'),
                    'EXPIRE'         => $t('Expiré'),
                    'BROUILLON'      => $t('Brouillon'),
                    'ANNULE'         => $t('Annulé'),
                    default          => $quote->statut,
                };
                $isActionable = $quote->statut === 'ENVOYE';
            @endphp
            <tr class="border-b border-[#E2E8F0] hover:bg-[#EBF4FF] transition-colors">
                <td class="px-4 py-3 font-mono text-sm font-semibold text-[#0D1F3C]">{{ $quote->numero_devis }}</td>
                <td class="px-4 py-3 text-sm text-[#6B7280]">{{ $quote->created_at->format('d/m/Y') }}</td>
                <td class="px-4 py-3 text-sm text-[#4B5563] text-center">
                    <span class="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#EBF4FF] text-[#1A4A8C] font-bold text-xs">
                        {{ $quote->lignes()->count() }}
                    </span>
                </td>
                <td class="px-4 py-3 text-sm font-semibold text-[#0D1F3C] text-right">
                    {{ number_format($quote->total_ttc ?? 0, 0, ',', ' ') }} <span class="text-[#94A3B8] font-normal text-xs">DZD</span>
                </td>
                <td class="px-4 py-3">
                    <span class="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold {{ $badge }}">{{ $label }}</span>
                </td>
                <td class="px-4 py-3">
                    <div class="flex items-center justify-end gap-1">
                        <a href="{{ route('client.quotes.show', $quote->id) }}"
                           class="p-2 rounded-lg hover:bg-[#F0F4F8] text-[#475569] inline-flex transition-colors" title="{{ $t('Voir') }}">
                            <i class="fas fa-eye text-sm"></i>
                        </a>

                        @if($isActionable)
                        <form method="POST" action="{{ route('client.quotes.accept', $quote->id) }}" class="inline">
                            @csrf
                            <button type="submit"
                                onclick="return confirm('{{ $t('Accepter') }} ?')"
                                class="px-2 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-medium transition-colors flex items-center gap-1">
                                <i class="fas fa-check text-xs"></i> {{ $t('Accepter') }}
                            </button>
                        </form>

                        <form method="POST" action="{{ route('client.quotes.reject', $quote->id) }}" class="inline">
                            @csrf
                            <button type="submit"
                                onclick="return confirm('{{ $t('Rejeter') }} ?')"
                                class="px-2 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 text-xs font-medium transition-colors flex items-center gap-1">
                                <i class="fas fa-times text-xs"></i> {{ $t('Rejeter') }}
                            </button>
                        </form>

                        <a href="{{ route('client.quotes.show', $quote->id) }}"
                           class="px-2 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-medium transition-colors flex items-center gap-1">
                            <i class="fas fa-edit text-xs"></i> {{ $t('Modifier') }}
                        </a>
                        @endif
                    </div>
                </td>
            </tr>
            @empty
            <tr>
                <td colspan="6" class="py-16 text-center">
                    <i class="fas fa-file-alt fa-4x text-[#CBD5E1] mb-3 block"></i>
                    <p class="text-[#6B7280] font-medium">{{ $t('Aucun élément à afficher pour le moment.') }}</p>
                    <p class="text-sm text-[#94A3B8] mt-1">{{ $t('Les devis apparaîtront ici une fois générés par notre équipe.') }}</p>
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
