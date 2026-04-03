@extends('layouts.gslc')
@section('page_title', 'Navires')

@section('content')

<div class="bg-white rounded-xl border border-[#E2E8F0] shadow-sm border-l-4 border-l-[#CFA030] p-4 mb-5 flex items-center justify-between">
    <div>
        <h1 class="text-2xl font-bold text-[#0D1F3C]">Gestion des Navires</h1>
        <p class="text-sm text-[#6B7280]">NASHCO — Flotte et escales</p>
    </div>
    <img src="{{ asset('images/nashco_logo Company.jpg') }}" alt="NASHCO" class="h-12 w-auto rounded-lg">
</div>

<div class="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-4 mb-4">
    <form method="GET" action="{{ route('blade.commercial.vessels') }}" class="flex flex-wrap gap-3 items-center">
        <div class="flex-1 min-w-48">
            <input type="text" name="search" value="{{ request('search') }}"
                   placeholder="Rechercher par nom, IMO, compagnie..."
                   class="w-full border border-[#CBD5E1] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4A8C] bg-white">
        </div>
        <select name="actif" class="border border-[#CBD5E1] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4A8C] bg-white">
            <option value="">Tous</option>
            <option value="1" {{ request('actif') === '1' ? 'selected' : '' }}>Actifs</option>
            <option value="0" {{ request('actif') === '0' ? 'selected' : '' }}>Inactifs</option>
        </select>
        <button type="submit" class="bg-[#0D1F3C] text-white hover:bg-[#1A4A8C] rounded-lg px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2">
            <i class="fas fa-search"></i> Filtrer
        </button>
        @if(request()->hasAny(['search','actif']))
        <a href="{{ route('blade.commercial.vessels') }}" class="text-[#1A4A8C] text-sm hover:underline"><i class="fas fa-times mr-1"></i>Réinitialiser</a>
        @endif
        <a href="{{ route('blade.commercial.vessels.create') }}"
           class="ml-auto bg-[#CFA030] hover:bg-[#b8881f] text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2">
            <i class="fas fa-plus"></i> Ajouter un navire
        </a>
    </form>
</div>

<div class="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">
    <table class="w-full">
        <thead class="bg-[#0D1F3C]">
            <tr>
                <th class="text-left text-xs font-semibold text-white uppercase tracking-wider px-4 py-3">Navire</th>
                <th class="text-left text-xs font-semibold text-white uppercase tracking-wider px-4 py-3">N° IMO</th>
                <th class="text-left text-xs font-semibold text-white uppercase tracking-wider px-4 py-3">Compagnie</th>
                <th class="text-left text-xs font-semibold text-white uppercase tracking-wider px-4 py-3">Pavillon</th>
                <th class="text-left text-xs font-semibold text-white uppercase tracking-wider px-4 py-3">Capacité (TEU)</th>
                <th class="text-left text-xs font-semibold text-white uppercase tracking-wider px-4 py-3">Statut</th>
                <th class="text-right text-xs font-semibold text-white uppercase tracking-wider px-4 py-3">Actions</th>
            </tr>
        </thead>
        <tbody>
            @forelse($vessels as $vessel)
            <tr class="border-b border-[#E2E8F0] hover:bg-[#EBF4FF] transition-colors">
                <td class="px-4 py-3">
                    <div class="flex items-center gap-3">
                        <div class="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                            <i class="fas fa-ship text-[#1A4A8C] text-sm"></i>
                        </div>
                        <div>
                            <p class="text-sm font-semibold text-[#0D1F3C]">{{ $vessel->nom_navire }}</p>
                            @if($vessel->annee_construction)
                            <p class="text-xs text-[#6B7280]">Construit en {{ $vessel->annee_construction }}</p>
                            @endif
                        </div>
                    </div>
                </td>
                <td class="px-4 py-3">
                    <span class="font-mono text-xs bg-[#EDF2F7] text-[#0D1F3C] px-2 py-0.5 rounded">{{ $vessel->numero_imo }}</span>
                </td>
                <td class="px-4 py-3 text-sm text-[#4B5563]">{{ $vessel->compagnie_maritime ?? '—' }}</td>
                <td class="px-4 py-3 text-sm text-[#4B5563]">{{ $vessel->pays->nom_pays ?? '—' }}</td>
                <td class="px-4 py-3 text-sm font-semibold text-[#0D1F3C]">{{ number_format($vessel->capacite_teu) }}</td>
                <td class="px-4 py-3">
                    <span class="inline-flex px-2 py-1 rounded-full text-xs font-medium {{ $vessel->actif ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600' }}">
                        {{ $vessel->actif ? 'Actif' : 'Inactif' }}
                    </span>
                </td>
                <td class="px-4 py-3">
                    <div class="flex items-center justify-end gap-1">
                        <a href="{{ route('blade.commercial.vessels.edit', $vessel->id) }}"
                           class="p-2 rounded-lg hover:bg-[#F0F4F8] text-[#475569] transition-colors" title="Modifier">
                            <i class="fas fa-pencil text-sm"></i>
                        </a>
                        <form action="{{ route('blade.commercial.vessels.destroy', $vessel->id) }}" method="POST"
                              onsubmit="return confirm('Supprimer ce navire ?')">
                            @csrf @method('DELETE')
                            <button type="submit" class="p-2 rounded-lg hover:bg-red-50 text-red-500 transition-colors" title="Supprimer">
                                <i class="fas fa-trash text-sm"></i>
                            </button>
                        </form>
                    </div>
                </td>
            </tr>
            @empty
            <tr>
                <td colspan="7" class="py-16 text-center">
                    <i class="fas fa-ship fa-4x text-[#CBD5E1] mb-3 block"></i>
                    <p class="text-[#6B7280] font-medium">Aucun navire enregistré</p>
                    <a href="{{ route('blade.commercial.vessels.create') }}"
                       class="mt-4 inline-block bg-[#0D1F3C] text-white rounded-lg px-4 py-2 text-sm hover:bg-[#1A4A8C] transition-colors">
                        + Ajouter un navire
                    </a>
                </td>
            </tr>
            @endforelse
        </tbody>
    </table>
</div>

@if($vessels->hasPages())
<div class="mt-4">{{ $vessels->links() }}</div>
@endif

@endsection
