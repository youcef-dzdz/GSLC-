@extends('layouts.gslc')
@section('page_title', $t('Mes Conteneurs'))

@section('content')

<div class="bg-white rounded-xl border border-[#E2E8F0] shadow-sm border-l-4 border-l-[#CFA030] p-4 mb-5 flex items-center justify-between">
    <div>
        <h1 class="text-2xl font-bold text-[#0D1F3C]">{{ $t('Mes Conteneurs') }}</h1>
        <p class="text-sm text-[#6B7280]">{{ $t('Portail client NASHCO') }} — {{ $t('Suivi de vos conteneurs en location') }}</p>
    </div>
    <img src="{{ asset('images/nashco_logo Company.jpg') }}" alt="NASHCO" class="h-12 w-auto rounded-lg">
</div>

<div class="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-x-auto">
    <table class="w-full min-w-[700px]">
        <thead class="bg-[#0D1F3C]">
            <tr>
                <th class="text-left text-xs font-semibold text-white uppercase tracking-wider px-4 py-3">{{ $t('Référence') }}</th>
                <th class="text-left text-xs font-semibold text-white uppercase tracking-wider px-4 py-3">{{ $t('Type') }}</th>
                <th class="text-left text-xs font-semibold text-white uppercase tracking-wider px-4 py-3">{{ $t('Taille') }}</th>
                <th class="text-left text-xs font-semibold text-white uppercase tracking-wider px-4 py-3">{{ $t('État') }}</th>
                <th class="text-left text-xs font-semibold text-white uppercase tracking-wider px-4 py-3">{{ $t('Propriétaire') }}</th>
                <th class="text-left text-xs font-semibold text-white uppercase tracking-wider px-4 py-3">{{ $t('Statut') }}</th>
                <th class="text-right text-xs font-semibold text-white uppercase tracking-wider px-4 py-3">{{ $t('Actions') }}</th>
            </tr>
        </thead>
        <tbody>
            @forelse($containers as $container)
            @php
                $badge = match($container->statut) {
                    'DISPONIBLE'     => 'bg-emerald-50 text-emerald-700',
                    'EN_LOCATION'    => 'bg-blue-50 text-blue-700',
                    'EN_TRANSIT'     => 'bg-amber-50 text-amber-700',
                    'EN_MAINTENANCE' => 'bg-orange-50 text-orange-600',
                    'RESERVE'        => 'bg-purple-50 text-purple-700',
                    'HORS_SERVICE'   => 'bg-red-50 text-red-600',
                    default          => 'bg-slate-100 text-slate-600',
                };
                $label = match($container->statut) {
                    'DISPONIBLE'     => $t('Disponible'),
                    'EN_LOCATION'    => $t('En location'),
                    'EN_TRANSIT'     => $t('En transit'),
                    'EN_MAINTENANCE' => $t('En maintenance'),
                    'RESERVE'        => $t('Réservé'),
                    'HORS_SERVICE'   => $t('Hors service'),
                    default          => str_replace('_', ' ', $container->statut),
                };

                $typeCode = $container->type?->code_type ?? '';
                $size = str_starts_with($typeCode, '20') ? '20 ft'
                      : (str_starts_with($typeCode, '40') ? '40 ft' : '—');

                $etatBadge = match($container->etat_actuel ?? '') {
                    'BON_ETAT'     => 'text-emerald-600',
                    'MOYEN_ETAT'   => 'text-amber-600',
                    'MAUVAIS_ETAT' => 'text-red-600',
                    default        => 'text-[#94A3B8]',
                };
            @endphp
            <tr class="border-b border-[#E2E8F0] hover:bg-[#EBF4FF] transition-colors">
                <td class="px-4 py-3 font-mono text-sm font-semibold text-[#0D1F3C]">{{ $container->numero_conteneur }}</td>
                <td class="px-4 py-3 text-sm text-[#4B5563]">
                    @if($container->type)
                        <span class="inline-flex items-center gap-1.5">
                            <span class="px-1.5 py-0.5 bg-[#EBF4FF] text-[#1A4A8C] rounded text-xs font-mono font-bold">{{ $container->type->code_type }}</span>
                            <span class="text-[#6B7280]">{{ $container->type->libelle }}</span>
                        </span>
                    @else
                        <span class="text-[#94A3B8]">—</span>
                    @endif
                </td>
                <td class="px-4 py-3 text-sm">
                    <span class="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-700 rounded-full text-xs font-semibold">
                        <i class="fas fa-ruler-combined text-xs text-slate-400"></i> {{ $size }}
                    </span>
                </td>
                <td class="px-4 py-3 text-sm {{ $etatBadge }} font-medium">
                    {{ str_replace('_', ' ', $container->etat_actuel ?? '—') }}
                </td>
                <td class="px-4 py-3 text-sm text-[#6B7280]">{{ $container->proprietaire ?? 'NASHCO' }}</td>
                <td class="px-4 py-3">
                    <span class="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold {{ $badge }}">{{ $label }}</span>
                </td>
                <td class="px-4 py-3 text-right">
                    <span class="p-2 rounded-lg bg-[#F0F4F8] text-[#94A3B8] inline-flex cursor-default" title="{{ $t('Voir') }}">
                        <i class="fas fa-box text-sm"></i>
                    </span>
                </td>
            </tr>
            @empty
            <tr>
                <td colspan="7" class="py-16 text-center">
                    <i class="fas fa-box-open fa-4x text-[#CBD5E1] mb-3 block"></i>
                    <p class="text-[#6B7280] font-medium">{{ $t('Aucun élément à afficher pour le moment.') }}</p>
                    <p class="text-sm text-[#94A3B8] mt-1">{{ $t('Les conteneurs associés à vos contrats apparaîtront ici.') }}</p>
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
