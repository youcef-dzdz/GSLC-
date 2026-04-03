@extends('layouts.gslc')
@section('page_title', 'Inscriptions en attente')

@section('content')

<div class="bg-white rounded-xl border border-[#E2E8F0] shadow-sm border-l-4 border-l-[#CFA030] p-4 mb-5 flex items-center justify-between">
    <div>
        <h1 class="text-2xl font-bold text-[#0D1F3C]">Inscriptions en attente</h1>
        <p class="text-sm text-[#6B7280]">Demandes d'accès client à valider</p>
    </div>
    <div class="flex items-center gap-3">
        @if($clients->total() > 0)
        <span class="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full">{{ $clients->total() }} en attente</span>
        @endif
        <img src="{{ asset('images/nashco_logo Company.jpg') }}" alt="NASHCO" class="h-12 w-auto rounded-lg">
    </div>
</div>

<div class="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-4 mb-4">
    <form method="GET" action="{{ route('blade.admin.registrations') }}" class="flex gap-3 items-center">
        <div class="flex-1">
            <input type="text" name="search" value="{{ request('search') }}"
                   placeholder="Rechercher par raison sociale, NIF, email..."
                   class="w-full border border-[#CBD5E1] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4A8C] bg-white">
        </div>
        <button type="submit" class="bg-[#0D1F3C] text-white hover:bg-[#1A4A8C] rounded-lg px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2">
            <i class="fas fa-search"></i> Chercher
        </button>
    </form>
</div>

{{-- Reject modal --}}
<div id="rejectModal" class="fixed inset-0 bg-black/50 z-50 hidden items-center justify-center">
    <div class="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
        <h3 class="text-lg font-bold text-[#0D1F3C] mb-4">Rejeter l'inscription</h3>
        <form id="rejectForm" method="POST">
            @csrf
            <div class="mb-4">
                <label class="text-sm font-medium text-[#374151] mb-1 block">Motif du rejet <span class="text-red-500">*</span></label>
                <textarea name="motif_rejet" rows="4" required
                          placeholder="Expliquez la raison du rejet..."
                          class="w-full border border-[#CBD5E1] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4A8C] resize-none"></textarea>
            </div>
            <div class="flex gap-3">
                <button type="submit" class="bg-red-600 hover:bg-red-700 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors">
                    Confirmer le rejet
                </button>
                <button type="button" onclick="closeRejectModal()"
                        class="bg-white border border-[#CBD5E1] text-[#0D1F3C] hover:bg-[#F0F4F8] rounded-lg px-4 py-2 text-sm transition-colors">
                    Annuler
                </button>
            </div>
        </form>
    </div>
</div>

@forelse($clients as $client)
<div class="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden mb-4">
    <div class="bg-amber-50 border-b border-amber-100 px-5 py-3 flex items-center justify-between">
        <div class="flex items-center gap-3">
            <span class="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                <i class="fas fa-clock text-amber-600 text-sm"></i>
            </span>
            <div>
                <p class="font-semibold text-[#0D1F3C]">{{ $client->raison_sociale }}</p>
                <p class="text-xs text-[#6B7280]">Soumis le {{ $client->created_at ? $client->created_at->format('d/m/Y à H:i') : '—' }}</p>
            </div>
        </div>
        <div class="flex items-center gap-2">
            <form action="{{ route('blade.admin.registrations.approve', $client->id) }}" method="POST"
                  onsubmit="return confirm('Approuver l\'inscription de {{ $client->raison_sociale }} ?')">
                @csrf
                <button type="submit" class="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-3 py-1.5 text-sm font-medium transition-colors flex items-center gap-1.5">
                    <i class="fas fa-check"></i> Approuver
                </button>
            </form>
            <button type="button"
                    onclick="openRejectModal('{{ route('blade.admin.registrations.reject', $client->id) }}')"
                    class="bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 rounded-lg px-3 py-1.5 text-sm transition-colors flex items-center gap-1.5">
                <i class="fas fa-times"></i> Rejeter
            </button>
        </div>
    </div>
    <div class="p-5 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
            <p class="text-xs text-[#94A3B8] uppercase tracking-wider">NIF</p>
            <p class="font-mono text-sm text-[#0D1F3C]">{{ $client->nif }}</p>
        </div>
        <div>
            <p class="text-xs text-[#94A3B8] uppercase tracking-wider">NIS</p>
            <p class="font-mono text-sm text-[#0D1F3C]">{{ $client->nis }}</p>
        </div>
        <div>
            <p class="text-xs text-[#94A3B8] uppercase tracking-wider">RC</p>
            <p class="font-mono text-sm text-[#0D1F3C]">{{ $client->rc }}</p>
        </div>
        <div>
            <p class="text-xs text-[#94A3B8] uppercase tracking-wider">Type</p>
            <p class="text-sm text-[#0D1F3C]">{{ $client->type_client }}</p>
        </div>
        <div>
            <p class="text-xs text-[#94A3B8] uppercase tracking-wider">Ville</p>
            <p class="text-sm text-[#0D1F3C]">{{ $client->ville }} @if($client->pays)— {{ $client->pays->nom_pays }}@endif</p>
        </div>
        <div>
            <p class="text-xs text-[#94A3B8] uppercase tracking-wider">Représentant</p>
            <p class="text-sm text-[#0D1F3C]">{{ $client->rep_prenom }} {{ $client->rep_nom }}</p>
            <p class="text-xs text-[#6B7280]">{{ $client->rep_role }}</p>
        </div>
        <div>
            <p class="text-xs text-[#94A3B8] uppercase tracking-wider">Email</p>
            <p class="text-sm text-[#1A4A8C]">{{ $client->rep_email }}</p>
        </div>
        <div>
            <p class="text-xs text-[#94A3B8] uppercase tracking-wider">Téléphone</p>
            <p class="text-sm text-[#0D1F3C]">{{ $client->rep_tel }}</p>
        </div>
    </div>
</div>
@empty
<div class="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-16 text-center">
    <i class="fas fa-check-circle fa-4x text-emerald-300 mb-3 block"></i>
    <p class="text-[#6B7280] font-medium">Aucune inscription en attente</p>
    <p class="text-sm text-[#94A3B8] mt-1">Toutes les demandes ont été traitées.</p>
</div>
@endforelse

@if($clients->hasPages())
<div class="mt-4">{{ $clients->links() }}</div>
@endif

@push('scripts')
<script>
function openRejectModal(action) {
    document.getElementById('rejectForm').action = action;
    document.getElementById('rejectModal').classList.remove('hidden');
    document.getElementById('rejectModal').classList.add('flex');
}
function closeRejectModal() {
    document.getElementById('rejectModal').classList.add('hidden');
    document.getElementById('rejectModal').classList.remove('flex');
}
</script>
@endpush

@endsection
