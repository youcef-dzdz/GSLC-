@extends('layouts.gslc')
@section('page_title', isset($client) ? 'Modifier Client' : 'Nouveau Client')

@section('content')

@php $isEdit = isset($client); @endphp

{{-- Header --}}
<div class="bg-white rounded-xl border border-[#E2E8F0] shadow-sm border-l-4 border-l-[#CFA030] p-4 mb-5 flex items-center justify-between">
    <div>
        <h1 class="text-2xl font-bold text-[#0D1F3C]">
            {{ $isEdit ? 'Modifier — ' . $client->raison_sociale : 'Nouveau Client' }}
        </h1>
        <p class="text-sm text-[#6B7280]">{{ $isEdit ? 'Mise à jour des informations client' : 'Enregistrement d\'un nouveau client importateur' }}</p>
    </div>
    <img src="{{ asset('images/nashco_logo Company.jpg') }}" alt="NASHCO" class="h-12 w-auto rounded-lg">
</div>

<form method="POST"
      action="{{ $isEdit ? route('blade.commercial.clients.update', $client->id) : route('blade.commercial.clients.store') }}">
    @csrf
    @if($isEdit) @method('PUT') @endif

    {{-- Section 1 — Entreprise --}}
    <div class="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden mb-5">
        <div class="bg-[#F0F4F8] border-b border-[#E2E8F0] px-5 py-3">
            <h2 class="text-sm font-bold text-[#0D1F3C] uppercase tracking-wider flex items-center gap-2">
                <i class="fas fa-building text-[#CFA030]"></i> Informations Entreprise
            </h2>
        </div>
        <div class="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">

            <div class="md:col-span-2">
                <label class="text-sm font-medium text-[#374151] mb-1 block">Raison sociale <span class="text-red-500">*</span></label>
                <input type="text" name="raison_sociale" value="{{ old('raison_sociale', $client->raison_sociale ?? '') }}" required
                       class="w-full border {{ $errors->has('raison_sociale') ? 'border-red-400' : 'border-[#CBD5E1]' }} rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4A8C] bg-white">
                @error('raison_sociale')<p class="text-red-600 text-xs mt-1">{{ $message }}</p>@enderror
            </div>

            <div>
                <label class="text-sm font-medium text-[#374151] mb-1 block">NIF <span class="text-red-500">*</span></label>
                <input type="text" name="nif" value="{{ old('nif', $client->nif ?? '') }}" required
                       class="w-full border {{ $errors->has('nif') ? 'border-red-400' : 'border-[#CBD5E1]' }} rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#1A4A8C] bg-white">
                @error('nif')<p class="text-red-600 text-xs mt-1">{{ $message }}</p>@enderror
            </div>

            <div>
                <label class="text-sm font-medium text-[#374151] mb-1 block">NIS <span class="text-red-500">*</span></label>
                <input type="text" name="nis" value="{{ old('nis', $client->nis ?? '') }}" required
                       class="w-full border {{ $errors->has('nis') ? 'border-red-400' : 'border-[#CBD5E1]' }} rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#1A4A8C] bg-white">
                @error('nis')<p class="text-red-600 text-xs mt-1">{{ $message }}</p>@enderror
            </div>

            <div>
                <label class="text-sm font-medium text-[#374151] mb-1 block">Registre du Commerce (RC) <span class="text-red-500">*</span></label>
                <input type="text" name="rc" value="{{ old('rc', $client->rc ?? '') }}" required
                       class="w-full border {{ $errors->has('rc') ? 'border-red-400' : 'border-[#CBD5E1]' }} rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#1A4A8C] bg-white">
                @error('rc')<p class="text-red-600 text-xs mt-1">{{ $message }}</p>@enderror
            </div>

            <div>
                <label class="text-sm font-medium text-[#374151] mb-1 block">Type de client <span class="text-red-500">*</span></label>
                <select name="type_client" required
                        class="w-full border {{ $errors->has('type_client') ? 'border-red-400' : 'border-[#CBD5E1]' }} rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4A8C] bg-white">
                    <option value="ORDINAIRE" {{ old('type_client', $client->type_client ?? '') === 'ORDINAIRE' ? 'selected' : '' }}>Ordinaire</option>
                    <option value="EN_PNUE"   {{ old('type_client', $client->type_client ?? '') === 'EN_PNUE' ? 'selected' : '' }}>EN PNUE</option>
                    <option value="EXPORTATEUR" {{ old('type_client', $client->type_client ?? '') === 'EXPORTATEUR' ? 'selected' : '' }}>Exportateur</option>
                </select>
                @error('type_client')<p class="text-red-600 text-xs mt-1">{{ $message }}</p>@enderror
            </div>

            <div class="md:col-span-2">
                <label class="text-sm font-medium text-[#374151] mb-1 block">Adresse du siège <span class="text-red-500">*</span></label>
                <textarea name="adresse_siege" rows="2" required
                          class="w-full border {{ $errors->has('adresse_siege') ? 'border-red-400' : 'border-[#CBD5E1]' }} rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4A8C] bg-white resize-none">{{ old('adresse_siege', $client->adresse_siege ?? '') }}</textarea>
                @error('adresse_siege')<p class="text-red-600 text-xs mt-1">{{ $message }}</p>@enderror
            </div>

            <div>
                <label class="text-sm font-medium text-[#374151] mb-1 block">Ville <span class="text-red-500">*</span></label>
                <input type="text" name="ville" value="{{ old('ville', $client->ville ?? '') }}" required
                       class="w-full border {{ $errors->has('ville') ? 'border-red-400' : 'border-[#CBD5E1]' }} rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4A8C] bg-white">
                @error('ville')<p class="text-red-600 text-xs mt-1">{{ $message }}</p>@enderror
            </div>

            <div>
                <label class="text-sm font-medium text-[#374151] mb-1 block">Pays <span class="text-red-500">*</span></label>
                <select name="pays_id" required
                        class="w-full border {{ $errors->has('pays_id') ? 'border-red-400' : 'border-[#CBD5E1]' }} rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4A8C] bg-white">
                    <option value="">-- Sélectionner --</option>
                    @foreach($pays as $p)
                    <option value="{{ $p->id }}" {{ old('pays_id', $client->pays_id ?? '') == $p->id ? 'selected' : '' }}>{{ $p->nom_pays }}</option>
                    @endforeach
                </select>
                @error('pays_id')<p class="text-red-600 text-xs mt-1">{{ $message }}</p>@enderror
            </div>
        </div>
    </div>

    {{-- Section 2 — Représentant --}}
    <div class="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden mb-5">
        <div class="bg-[#F0F4F8] border-b border-[#E2E8F0] px-5 py-3">
            <h2 class="text-sm font-bold text-[#0D1F3C] uppercase tracking-wider flex items-center gap-2">
                <i class="fas fa-user-tie text-[#CFA030]"></i> Représentant Légal
            </h2>
        </div>
        <div class="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">

            <div>
                <label class="text-sm font-medium text-[#374151] mb-1 block">Nom <span class="text-red-500">*</span></label>
                <input type="text" name="rep_nom" value="{{ old('rep_nom', $client->rep_nom ?? '') }}" required
                       class="w-full border {{ $errors->has('rep_nom') ? 'border-red-400' : 'border-[#CBD5E1]' }} rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4A8C] bg-white">
                @error('rep_nom')<p class="text-red-600 text-xs mt-1">{{ $message }}</p>@enderror
            </div>

            <div>
                <label class="text-sm font-medium text-[#374151] mb-1 block">Prénom <span class="text-red-500">*</span></label>
                <input type="text" name="rep_prenom" value="{{ old('rep_prenom', $client->rep_prenom ?? '') }}" required
                       class="w-full border {{ $errors->has('rep_prenom') ? 'border-red-400' : 'border-[#CBD5E1]' }} rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4A8C] bg-white">
                @error('rep_prenom')<p class="text-red-600 text-xs mt-1">{{ $message }}</p>@enderror
            </div>

            <div>
                <label class="text-sm font-medium text-[#374151] mb-1 block">Titre / Fonction <span class="text-red-500">*</span></label>
                <input type="text" name="rep_role" value="{{ old('rep_role', $client->rep_role ?? '') }}" required
                       class="w-full border {{ $errors->has('rep_role') ? 'border-red-400' : 'border-[#CBD5E1]' }} rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4A8C] bg-white">
                @error('rep_role')<p class="text-red-600 text-xs mt-1">{{ $message }}</p>@enderror
            </div>

            <div>
                <label class="text-sm font-medium text-[#374151] mb-1 block">Téléphone <span class="text-red-500">*</span></label>
                <input type="text" name="rep_tel" value="{{ old('rep_tel', $client->rep_tel ?? '') }}" required
                       class="w-full border {{ $errors->has('rep_tel') ? 'border-red-400' : 'border-[#CBD5E1]' }} rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4A8C] bg-white">
                @error('rep_tel')<p class="text-red-600 text-xs mt-1">{{ $message }}</p>@enderror
            </div>

            @if(!$isEdit)
            <div class="md:col-span-2">
                <label class="text-sm font-medium text-[#374151] mb-1 block">Email (identifiant de connexion) <span class="text-red-500">*</span></label>
                <input type="email" name="rep_email" value="{{ old('rep_email') }}" required
                       class="w-full border {{ $errors->has('rep_email') ? 'border-red-400' : 'border-[#CBD5E1]' }} rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4A8C] bg-white">
                @error('rep_email')<p class="text-red-600 text-xs mt-1">{{ $message }}</p>@enderror
                <p class="text-xs text-[#6B7280] mt-1">
                    <i class="fas fa-info-circle mr-1 text-[#CFA030]"></i>
                    Un compte d'accès sera automatiquement créé avec un mot de passe temporaire.
                </p>
            </div>
            @else
            <div class="md:col-span-2">
                <label class="text-sm font-medium text-[#374151] mb-1 block">Email</label>
                <input type="email" value="{{ $client->rep_email }}" disabled
                       class="w-full border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm bg-[#F0F4F8] text-[#94A3B8] cursor-not-allowed">
                <p class="text-xs text-[#94A3B8] mt-1">L'email ne peut pas être modifié ici.</p>
            </div>
            @endif
        </div>
    </div>

    {{-- Actions --}}
    <div class="flex items-center gap-3">
        <button type="submit"
                class="bg-[#0D1F3C] text-white hover:bg-[#1A4A8C] rounded-lg px-6 py-2.5 text-sm font-medium transition-colors flex items-center gap-2">
            <i class="fas fa-save"></i>
            {{ $isEdit ? 'Enregistrer les modifications' : 'Créer le client' }}
        </button>
        <a href="{{ route('blade.commercial.clients') }}"
           class="bg-white border border-[#CBD5E1] text-[#0D1F3C] hover:bg-[#F0F4F8] rounded-lg px-4 py-2.5 text-sm transition-colors">
            Annuler
        </a>
    </div>
</form>

@endsection
