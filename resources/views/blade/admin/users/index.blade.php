@extends('layouts.gslc')
@section('page_title', 'Utilisateurs')

@section('content')

<div class="bg-white rounded-xl border border-[#E2E8F0] shadow-sm border-l-4 border-l-[#CFA030] p-4 mb-5 flex items-center justify-between">
    <div>
        <h1 class="text-2xl font-bold text-[#0D1F3C]">Gestion des Utilisateurs</h1>
        <p class="text-sm text-[#6B7280]">Personnel NASHCO — Tous services</p>
    </div>
    <div class="flex items-center gap-3">
        <a href="{{ route('blade.admin.users.create') }}"
           class="bg-[#CFA030] hover:bg-[#b8881f] text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2">
            <i class="fas fa-plus"></i> Nouvel utilisateur
        </a>
        <img src="{{ asset('images/nashco_logo Company.jpg') }}" alt="NASHCO" class="h-12 w-auto rounded-lg">
    </div>
</div>

<div class="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-4 mb-4">
    <form method="GET" action="{{ route('blade.admin.users') }}" class="flex flex-wrap gap-3 items-center">
        <div class="flex-1 min-w-48">
            <input type="text" name="search" value="{{ request('search') }}"
                   placeholder="Nom, prénom, email..."
                   class="w-full border border-[#CBD5E1] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4A8C] bg-white">
        </div>
        <select name="role" class="border border-[#CBD5E1] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4A8C] bg-white">
            <option value="">Tous les rôles</option>
            @foreach($roles as $role)
            <option value="{{ $role->label }}" {{ request('role') === $role->label ? 'selected' : '' }}>{{ $role->nom_role }}</option>
            @endforeach
        </select>
        <select name="statut" class="border border-[#CBD5E1] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4A8C] bg-white">
            <option value="">Tous les statuts</option>
            <option value="ACTIF" {{ request('statut') === 'ACTIF' ? 'selected' : '' }}>Actif</option>
            <option value="SUSPENDU" {{ request('statut') === 'SUSPENDU' ? 'selected' : '' }}>Suspendu</option>
        </select>
        <button type="submit" class="bg-[#0D1F3C] text-white hover:bg-[#1A4A8C] rounded-lg px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2">
            <i class="fas fa-search"></i> Filtrer
        </button>
        @if(request()->hasAny(['search','role','statut']))
        <a href="{{ route('blade.admin.users') }}" class="text-[#1A4A8C] text-sm hover:underline"><i class="fas fa-times mr-1"></i>Réinitialiser</a>
        @endif
    </form>
</div>

<div class="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">
    <table class="w-full">
        <thead class="bg-[#0D1F3C]">
            <tr>
                <th class="text-left text-xs font-semibold text-white uppercase tracking-wider px-4 py-3">Utilisateur</th>
                <th class="text-left text-xs font-semibold text-white uppercase tracking-wider px-4 py-3">Email</th>
                <th class="text-left text-xs font-semibold text-white uppercase tracking-wider px-4 py-3">Rôle</th>
                <th class="text-left text-xs font-semibold text-white uppercase tracking-wider px-4 py-3">Position</th>
                <th class="text-left text-xs font-semibold text-white uppercase tracking-wider px-4 py-3">Statut</th>
                <th class="text-right text-xs font-semibold text-white uppercase tracking-wider px-4 py-3">Actions</th>
            </tr>
        </thead>
        <tbody>
            @forelse($users as $user)
            <tr class="border-b border-[#E2E8F0] hover:bg-[#EBF4FF] transition-colors">
                <td class="px-4 py-3">
                    <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-full bg-[#CFA030] flex items-center justify-center text-[#0D1F3C] text-xs font-bold flex-shrink-0">
                            {{ strtoupper(substr($user->prenom, 0, 1)) }}{{ strtoupper(substr($user->nom, 0, 1)) }}
                        </div>
                        <div>
                            <p class="text-sm font-semibold text-[#0D1F3C]">{{ $user->prenom }} {{ $user->nom }}</p>
                        </div>
                    </div>
                </td>
                <td class="px-4 py-3 text-sm text-[#4B5563]">{{ $user->email }}</td>
                <td class="px-4 py-3">
                    <span class="text-xs bg-[#EDF2F7] text-[#0D1F3C] px-2 py-0.5 rounded font-medium">{{ $user->role?->nom_role }}</span>
                </td>
                <td class="px-4 py-3 text-xs text-[#6B7280]">{{ $user->position ?? '—' }}</td>
                <td class="px-4 py-3">
                    <span class="inline-flex px-2 py-1 rounded-full text-xs font-medium {{ $user->statut === 'ACTIF' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700' }}">
                        {{ $user->statut }}
                    </span>
                </td>
                <td class="px-4 py-3">
                    <div class="flex items-center justify-end gap-1">
                        <a href="{{ route('blade.admin.users.edit', $user->id) }}"
                           class="p-2 rounded-lg hover:bg-[#F0F4F8] text-[#475569] transition-colors" title="Modifier">
                            <i class="fas fa-pencil text-sm"></i>
                        </a>
                        @if($user->isAgent())
                        <a href="{{ route('blade.admin.users.permissions', $user->id) }}"
                           class="p-2 rounded-lg hover:bg-[#F0F4F8] text-[#475569] transition-colors" title="Permissions">
                            <i class="fas fa-lock text-sm"></i>
                        </a>
                        @endif
                        @if($user->id !== auth()->id())
                        <form action="{{ route('blade.admin.users.block', $user->id) }}" method="POST">
                            @csrf
                            <button type="submit"
                                    class="p-2 rounded-lg transition-colors {{ $user->statut === 'ACTIF' ? 'hover:bg-amber-50 text-amber-500' : 'hover:bg-emerald-50 text-emerald-500' }}"
                                    title="{{ $user->statut === 'ACTIF' ? 'Suspendre' : 'Réactiver' }}">
                                <i class="fas {{ $user->statut === 'ACTIF' ? 'fa-user-slash' : 'fa-user-check' }} text-sm"></i>
                            </button>
                        </form>
                        @endif
                    </div>
                </td>
            </tr>
            @empty
            <tr>
                <td colspan="6" class="py-16 text-center">
                    <i class="fas fa-users fa-4x text-[#CBD5E1] mb-3 block"></i>
                    <p class="text-[#6B7280] font-medium">Aucun utilisateur trouvé</p>
                </td>
            </tr>
            @endforelse
        </tbody>
    </table>
</div>

@if($users->hasPages())
<div class="mt-4">{{ $users->links() }}</div>
@endif

@endsection
