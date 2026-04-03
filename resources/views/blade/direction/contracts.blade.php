@extends('layouts.gslc')
@section('page_title', 'Contrats — Direction')

@section('content')

<div class="bg-white rounded-xl border border-[#E2E8F0] shadow-sm border-l-4 border-l-[#CFA030] p-4 mb-5 flex items-center justify-between">
    <div>
        <h1 class="text-2xl font-bold text-[#0D1F3C]">Contrats — Validation Direction</h1>
        <p class="text-sm text-[#6B7280]">NASHCO — Approbation & Suivi</p>
    </div>
    <img src="{{ asset('images/nashco_logo Company.jpg') }}" alt="NASHCO" class="h-12 w-auto rounded-lg">
</div>

{{-- Return modal --}}
<div id="returnModal" class="fixed inset-0 bg-black/50 z-50 hidden items-center justify-center">
    <div class="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
        <h3 class="text-lg font-bold text-[#0D1F3C] mb-4">Retourner pour révision</h3>
        <form id="returnForm" method="POST">
            @csrf
            <div class="mb-4">
                <label class="text-sm font-medium text-[#374151] mb-1 block">Motif <span class="text-red-500">*</span></label>
                <textarea name="motif" rows="4" required
                          placeholder="Précisez les modifications demandées..."
                          class="w-full border border-[#CBD5E1] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4A8C] resize-none"></textarea>
            </div>
            <div class="flex gap-3">
                <button type="submit" class="bg-amber-500 hover:bg-amber-600 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors">
                    Retourner
                </button>
                <button type="button" onclick="closeReturnModal()"
                        class="bg-white border border-[#CBD5E1] text-[#0D1F3C] hover:bg-[#F0F4F8] rounded-lg px-4 py-2 text-sm transition-colors">
                    Annuler
                </button>
            </div>
        </form>
    </div>
</div>

<div class="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-4 mb-4">
    <form method="GET" action="{{ route('blade.direction.contracts') }}" class="flex flex-wrap gap-3 items-center">
        <div class="flex-1 min-w-48">
            <input type="text" name="search" value="{{ $search ?? '' }}"
                   placeholder="N° contrat ou raison sociale..."
                   class="w-full border border-[#CBD5E1] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4A8C] bg-white">
        </div>
        <select name="statut" class="border border-[#CBD5E1] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4A8C] bg-white">
            <option value="">Tous les statuts</option>
            @foreach(['EN_ATTENTE_SIGNATURE','ACTIF','EXPIRE','RESILIE','SUSPENDU'] as $s)
            <option value="{{ $s }}" {{ request('statut') === $s ? 'selected' : '' }}>{{ str_replace('_', ' ', $s) }}</option>
            @endforeach
        </select>
        <button type="submit" class="bg-[#0D1F3C] text-white hover:bg-[#1A4A8C] rounded-lg px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2">
            <i class="fas fa-search"></i> Filtrer
        </button>
        @if(request()->hasAny(['search','statut']))
        <a href="{{ route('blade.direction.contracts') }}" class="text-[#1A4A8C] text-sm hover:underline"><i class="fas fa-times mr-1"></i>Réinitialiser</a>
        @endif
    </form>
</div>

<div class="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">
    <table class="w-full">
        <thead class="bg-[#0D1F3C]">
            <tr>
                <th class="text-left text-xs font-semibold text-white uppercase tracking-wider px-4 py-3">N° Contrat</th>
                <th class="text-left text-xs font-semibold text-white uppercase tracking-wider px-4 py-3">Client</th>
                <th class="text-left text-xs font-semibold text-white uppercase tracking-wider px-4 py-3">Type</th>
                <th class="text-left text-xs font-semibold text-white uppercase tracking-wider px-4 py-3">Caution</th>
                <th class="text-left text-xs font-semibold text-white uppercase tracking-wider px-4 py-3">Statut</th>
                <th class="text-right text-xs font-semibold text-white uppercase tracking-wider px-4 py-3">Actions</th>
            </tr>
        </thead>
        <tbody>
            @forelse($contracts as $contract)
            @php
                $statusColor = match($contract->statut) {
                    'ACTIF'                => 'bg-emerald-50 text-emerald-700',
                    'EN_ATTENTE_SIGNATURE' => 'bg-amber-50 text-amber-700',
                    'EXPIRE'               => 'bg-slate-100 text-slate-500',
                    'RESILIE'              => 'bg-red-50 text-red-700',
                    default                => 'bg-slate-100 text-slate-600',
                };
            @endphp
            <tr class="border-b border-[#E2E8F0] hover:bg-[#EBF4FF] transition-colors">
                <td class="px-4 py-3">
                    <span class="font-mono text-xs font-semibold text-[#0D1F3C]">{{ $contract->numero_contrat }}</span>
                    <p class="text-xs text-[#94A3B8] mt-0.5">{{ $contract->created_at->format('d/m/Y') }}</p>
                </td>
                <td class="px-4 py-3 text-sm text-[#4B5563]">{{ $contract->client?->raison_sociale ?? '—' }}</td>
                <td class="px-4 py-3 text-xs text-[#6B7280]">{{ $contract->type_contrat ?? '—' }}</td>
                <td class="px-4 py-3 text-sm text-[#0D1F3C]">
                    @if($contract->montant_caution)
                    {{ number_format($contract->montant_caution, 0, ',', ' ') }} DZD
                    @else
                    <span class="text-[#94A3B8]">—</span>
                    @endif
                </td>
                <td class="px-4 py-3">
                    <span class="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold {{ $statusColor }}">
                        {{ str_replace('_', ' ', $contract->statut) }}
                    </span>
                </td>
                <td class="px-4 py-3">
                    <div class="flex items-center justify-end gap-1">
                        @if($contract->statut === 'EN_ATTENTE_SIGNATURE')
                        <form action="{{ route('blade.direction.contracts.approve', $contract->id) }}" method="POST"
                              onsubmit="return confirm('Approuver et activer ce contrat ?')">
                            @csrf
                            <button type="submit"
                                    class="p-2 rounded-lg hover:bg-emerald-50 text-emerald-600 transition-colors" title="Approuver">
                                <i class="fas fa-check text-sm"></i>
                            </button>
                        </form>
                        <button type="button"
                                onclick="openReturnModal('{{ route('blade.direction.contracts.return', $contract->id) }}')"
                                class="p-2 rounded-lg hover:bg-amber-50 text-amber-500 transition-colors" title="Retourner pour révision">
                            <i class="fas fa-undo text-sm"></i>
                        </button>
                        @endif
                        <a href="{{ route('blade.commercial.contracts.show', $contract->id) }}"
                           class="p-2 rounded-lg hover:bg-[#F0F4F8] text-[#475569] transition-colors" title="Voir détail">
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

@push('scripts')
<script>
function openReturnModal(action) {
    document.getElementById('returnForm').action = action;
    document.getElementById('returnModal').classList.remove('hidden');
    document.getElementById('returnModal').classList.add('flex');
}
function closeReturnModal() {
    document.getElementById('returnModal').classList.add('hidden');
    document.getElementById('returnModal').classList.remove('flex');
}
</script>
@endpush

@endsection
