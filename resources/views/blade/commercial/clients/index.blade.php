@extends('layouts.gslc')
@section('page_title', 'Clients')

@section('content')

{{-- Page header --}}
<div class="bg-white rounded-xl border border-[#E2E8F0] shadow-sm border-l-4 border-l-[#CFA030] p-4 mb-5 flex items-center justify-between">
    <div>
        <h1 class="text-2xl font-bold text-[#0D1F3C]">Gestion des Clients</h1>
        <p class="text-sm text-[#6B7280]">NASHCO — Service Commercial</p>
    </div>
    <img src="{{ asset('images/nashco_logo Company.jpg') }}" alt="NASHCO" class="h-12 w-auto rounded-lg">
</div>

{{-- Filters bar --}}
<div class="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-4 mb-4">
    <form method="GET" action="{{ route('blade.commercial.clients') }}" class="flex flex-wrap gap-3 items-center">
        <div class="flex-1 min-w-48">
            <input type="text" name="search" value="{{ request('search') }}"
                   placeholder="Rechercher par raison sociale, NIF, email..."
                   class="w-full border border-[#CBD5E1] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4A8C] bg-white">
        </div>
        <select name="statut" class="border border-[#CBD5E1] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4A8C] bg-white">
            <option value="">Tous les statuts</option>
            <option value="APPROUVE" {{ request('statut') === 'APPROUVE' ? 'selected' : '' }}>Approuvé</option>
            <option value="EN_ATTENTE_VALIDATION" {{ request('statut') === 'EN_ATTENTE_VALIDATION' ? 'selected' : '' }}>En attente</option>
            <option value="REJETE" {{ request('statut') === 'REJETE' ? 'selected' : '' }}>Rejeté</option>
            <option value="SUSPENDU" {{ request('statut') === 'SUSPENDU' ? 'selected' : '' }}>Suspendu</option>
        </select>
        <select name="type_client" class="border border-[#CBD5E1] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4A8C] bg-white">
            <option value="">Tous les types</option>
            <option value="ORDINAIRE" {{ request('type_client') === 'ORDINAIRE' ? 'selected' : '' }}>Ordinaire</option>
            <option value="EN_PNUE" {{ request('type_client') === 'EN_PNUE' ? 'selected' : '' }}>EN PNUE</option>
            <option value="EXPORTATEUR" {{ request('type_client') === 'EXPORTATEUR' ? 'selected' : '' }}>Exportateur</option>
        </select>
        <button type="submit" class="bg-[#0D1F3C] text-white hover:bg-[#1A4A8C] rounded-lg px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2">
            <i class="fas fa-search"></i> Filtrer
        </button>
        @if(request()->hasAny(['search','statut','type_client']))
        <a href="{{ route('blade.commercial.clients') }}" class="text-[#1A4A8C] text-sm hover:underline">
            <i class="fas fa-times mr-1"></i>Réinitialiser
        </a>
        @endif
        <a href="{{ route('blade.commercial.clients.create') }}"
           class="ml-auto bg-[#CFA030] hover:bg-[#b8881f] text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2">
            <i class="fas fa-plus"></i> Nouveau client
        </a>
    </form>
</div>

{{-- Table --}}
<div class="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">
    <table class="w-full">
        <thead class="bg-[#0D1F3C]">
            <tr>
                <th class="text-left text-xs font-semibold text-white uppercase tracking-wider px-4 py-3">Raison Sociale</th>
                <th class="text-left text-xs font-semibold text-white uppercase tracking-wider px-4 py-3">RC</th>
                <th class="text-left text-xs font-semibold text-white uppercase tracking-wider px-4 py-3">NIF / NIS</th>
                <th class="text-left text-xs font-semibold text-white uppercase tracking-wider px-4 py-3">Représentant</th>
                <th class="text-left text-xs font-semibold text-white uppercase tracking-wider px-4 py-3">Ville</th>
                <th class="text-left text-xs font-semibold text-white uppercase tracking-wider px-4 py-3">Statut</th>
                <th class="text-right text-xs font-semibold text-white uppercase tracking-wider px-4 py-3">Actions</th>
            </tr>
        </thead>
        <tbody>
            @forelse($clients as $client)
            <tr class="border-b border-[#E2E8F0] hover:bg-[#EBF4FF] transition-colors">
                <td class="px-4 py-3">
                    <div class="flex items-center gap-3">
                        <div class="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                            <i class="fas fa-building text-[#1A4A8C] text-sm"></i>
                        </div>
                        <div>
                            <p class="text-sm font-semibold text-[#0D1F3C]">{{ $client->raison_sociale }}</p>
                            <p class="text-xs text-[#6B7280]">{{ $client->type_client }}</p>
                        </div>
                    </div>
                </td>
                <td class="px-4 py-3">
                    <span class="font-mono text-xs bg-[#EDF2F7] text-[#0D1F3C] px-2 py-0.5 rounded">{{ $client->rc }}</span>
                </td>
                <td class="px-4 py-3 space-y-1">
                    <div><span class="font-mono text-xs bg-[#EDF2F7] text-[#0D1F3C] px-2 py-0.5 rounded">NIF: {{ $client->nif }}</span></div>
                    <div><span class="font-mono text-xs bg-[#EDF2F7] text-[#0D1F3C] px-2 py-0.5 rounded">NIS: {{ $client->nis }}</span></div>
                </td>
                <td class="px-4 py-3">
                    <p class="text-sm text-[#4B5563]">{{ $client->rep_prenom }} {{ $client->rep_nom }}</p>
                    <p class="text-xs text-[#6B7280]">{{ $client->rep_email }}</p>
                </td>
                <td class="px-4 py-3 text-sm text-[#4B5563]">
                    {{ $client->ville }}
                    @if($client->pays)
                    <span class="text-xs text-[#94A3B8]">— {{ $client->pays->nom_pays }}</span>
                    @endif
                </td>
                <td class="px-4 py-3">
                    @php
                        $badgeClass = match($client->statut) {
                            'APPROUVE'              => 'bg-emerald-50 text-emerald-700',
                            'EN_ATTENTE_VALIDATION' => 'bg-amber-50 text-amber-700',
                            'REJETE'                => 'bg-red-50 text-red-700',
                            'SUSPENDU'              => 'bg-slate-100 text-slate-600',
                            default                 => 'bg-slate-100 text-slate-600',
                        };
                        $badgeLabel = match($client->statut) {
                            'APPROUVE'              => 'Approuvé',
                            'EN_ATTENTE_VALIDATION' => 'En attente',
                            'REJETE'                => 'Rejeté',
                            'SUSPENDU'              => 'Suspendu',
                            default                 => $client->statut,
                        };
                    @endphp
                    <span class="inline-flex px-2 py-1 rounded-full text-xs font-medium {{ $badgeClass }}">
                        {{ $badgeLabel }}
                    </span>
                </td>
                <td class="px-4 py-3">
                    <div class="flex items-center justify-end gap-1">
                        <a href="{{ route('blade.commercial.clients.show', $client->id) }}"
                           class="p-2 rounded-lg hover:bg-[#F0F4F8] text-[#475569] transition-colors" title="Voir">
                            <i class="fas fa-eye text-sm"></i>
                        </a>
                        <a href="{{ route('blade.commercial.clients.edit', $client->id) }}"
                           class="p-2 rounded-lg hover:bg-[#F0F4F8] text-[#475569] transition-colors" title="Modifier">
                            <i class="fas fa-pencil text-sm"></i>
                        </a>
                        @if(auth()->user()->hasPermission('clients.delete'))
                        <form action="{{ route('blade.commercial.clients.destroy', $client->id) }}" method="POST"
                              onsubmit="return confirm('Supprimer ce client ? Cette action est irréversible.')">
                            @csrf
                            @method('DELETE')
                            <button type="submit" class="p-2 rounded-lg hover:bg-red-50 text-red-500 transition-colors" title="Supprimer">
                                <i class="fas fa-trash text-sm"></i>
                            </button>
                        </form>
                        @endif
                    </div>
                </td>
            </tr>
            @empty
            <tr>
                <td colspan="7" class="py-16 text-center">
                    <i class="fas fa-users fa-4x text-[#CBD5E1] mb-3 block"></i>
                    <p class="text-[#6B7280] font-medium">Aucun client enregistré</p>
                    <a href="{{ route('blade.commercial.clients.create') }}"
                       class="mt-4 inline-block bg-[#0D1F3C] text-white rounded-lg px-4 py-2 text-sm hover:bg-[#1A4A8C] transition-colors">
                        + Ajouter un client
                    </a>
                </td>
            </tr>
            @endforelse
        </tbody>
    </table>
</div>

{{-- Pagination --}}
@if($clients->hasPages())
<div class="mt-4">
    {{ $clients->links() }}
</div>
@endif

@endsection
