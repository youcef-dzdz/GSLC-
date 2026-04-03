@extends('layouts.gslc')
@section('page_title', isset($user) ? 'Modifier utilisateur' : 'Nouvel utilisateur')

@section('content')

<div class="bg-white rounded-xl border border-[#E2E8F0] shadow-sm border-l-4 border-l-[#CFA030] p-4 mb-5 flex items-center justify-between">
    <div>
        <h1 class="text-2xl font-bold text-[#0D1F3C]">
            {{ isset($user) ? 'Modifier l\'utilisateur' : 'Créer un utilisateur' }}
        </h1>
        <p class="text-sm text-[#6B7280]">Personnel NASHCO — Administration</p>
    </div>
    <div class="flex items-center gap-3">
        <a href="{{ route('blade.admin.users') }}"
           class="bg-white border border-[#CBD5E1] text-[#0D1F3C] hover:bg-[#F0F4F8] rounded-lg px-3 py-2 text-sm transition-colors flex items-center gap-2">
            <i class="fas fa-arrow-left text-[#CFA030]"></i> Retour
        </a>
        <img src="{{ asset('images/nashco_logo Company.jpg') }}" alt="NASHCO" class="h-12 w-auto rounded-lg">
    </div>
</div>

<div class="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-6 max-w-2xl">
    <form method="POST"
          action="{{ isset($user) ? route('blade.admin.users.update', $user->id) : route('blade.admin.users.store') }}">
        @csrf
        @if(isset($user)) @method('PUT') @endif

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

            {{-- Prénom --}}
            <div>
                <label class="block text-sm font-medium text-[#374151] mb-1">Prénom <span class="text-red-500">*</span></label>
                <input type="text" name="prenom" value="{{ old('prenom', $user->prenom ?? '') }}" required
                       class="w-full border border-[#CBD5E1] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4A8C] bg-white @error('prenom') border-red-400 @enderror">
                @error('prenom')<p class="text-red-500 text-xs mt-1">{{ $message }}</p>@enderror
            </div>

            {{-- Nom --}}
            <div>
                <label class="block text-sm font-medium text-[#374151] mb-1">Nom <span class="text-red-500">*</span></label>
                <input type="text" name="nom" value="{{ old('nom', $user->nom ?? '') }}" required
                       class="w-full border border-[#CBD5E1] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4A8C] bg-white @error('nom') border-red-400 @enderror">
                @error('nom')<p class="text-red-500 text-xs mt-1">{{ $message }}</p>@enderror
            </div>

            {{-- Email --}}
            <div class="md:col-span-2">
                <label class="block text-sm font-medium text-[#374151] mb-1">Adresse email <span class="text-red-500">*</span></label>
                <input type="email" name="email" value="{{ old('email', $user->email ?? '') }}" required
                       class="w-full border border-[#CBD5E1] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4A8C] bg-white @error('email') border-red-400 @enderror">
                @error('email')<p class="text-red-500 text-xs mt-1">{{ $message }}</p>@enderror
            </div>

            {{-- Password --}}
            <div class="md:col-span-2">
                <label class="block text-sm font-medium text-[#374151] mb-1">
                    Mot de passe {{ isset($user) ? '(laisser vide pour conserver)' : '' }}
                    @unless(isset($user))<span class="text-red-500">*</span>@endunless
                </label>
                <input type="password" name="password" {{ isset($user) ? '' : 'required' }}
                       class="w-full border border-[#CBD5E1] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4A8C] bg-white @error('password') border-red-400 @enderror"
                       placeholder="{{ isset($user) ? '••••••••' : 'Minimum 8 caractères' }}">
                @error('password')<p class="text-red-500 text-xs mt-1">{{ $message }}</p>@enderror
            </div>

            {{-- Rôle --}}
            <div>
                <label class="block text-sm font-medium text-[#374151] mb-1">Rôle <span class="text-red-500">*</span></label>
                <select name="role_id" required
                        class="w-full border border-[#CBD5E1] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4A8C] bg-white @error('role_id') border-red-400 @enderror">
                    <option value="">— Choisir un rôle —</option>
                    @foreach($roles as $role)
                    <option value="{{ $role->id }}" {{ old('role_id', $user->role_id ?? '') == $role->id ? 'selected' : '' }}>
                        {{ $role->nom_role }}
                    </option>
                    @endforeach
                </select>
                @error('role_id')<p class="text-red-500 text-xs mt-1">{{ $message }}</p>@enderror
            </div>

            {{-- Position --}}
            <div>
                <label class="block text-sm font-medium text-[#374151] mb-1">Poste / Position <span class="text-red-500">*</span></label>
                <input type="text" name="position" value="{{ old('position', $user->position ?? '') }}" required
                       placeholder="ex: Responsable Commercial"
                       class="w-full border border-[#CBD5E1] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4A8C] bg-white @error('position') border-red-400 @enderror">
                @error('position')<p class="text-red-500 text-xs mt-1">{{ $message }}</p>@enderror
            </div>

            {{-- Statut --}}
            <div class="md:col-span-2">
                <label class="block text-sm font-medium text-[#374151] mb-1">Statut <span class="text-red-500">*</span></label>
                <div class="flex gap-4 mt-1">
                    @foreach(['ACTIF' => 'Actif', 'SUSPENDU' => 'Suspendu'] as $val => $label)
                    <label class="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="statut" value="{{ $val }}"
                               {{ old('statut', $user->statut ?? 'ACTIF') === $val ? 'checked' : '' }}
                               class="text-[#1A4A8C] focus:ring-[#1A4A8C]">
                        <span class="text-sm text-[#374151]">{{ $label }}</span>
                    </label>
                    @endforeach
                </div>
                @error('statut')<p class="text-red-500 text-xs mt-1">{{ $message }}</p>@enderror
            </div>

        </div>

        <div class="mt-6 pt-4 border-t border-[#E2E8F0] flex items-center gap-3">
            <button type="submit"
                    class="bg-[#CFA030] hover:bg-[#b8881f] text-white rounded-lg px-5 py-2 text-sm font-medium transition-colors flex items-center gap-2">
                <i class="fas fa-save"></i> {{ isset($user) ? 'Enregistrer les modifications' : 'Créer l\'utilisateur' }}
            </button>
            <a href="{{ route('blade.admin.users') }}"
               class="text-[#6B7280] hover:text-[#0D1F3C] text-sm transition-colors">Annuler</a>
        </div>
    </form>
</div>

@endsection
