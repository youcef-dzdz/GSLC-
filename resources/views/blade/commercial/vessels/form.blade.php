@extends('layouts.gslc')
@section('page_title', isset($vessel) ? 'Modifier Navire' : 'Nouveau Navire')

@section('content')

@php $isEdit = isset($vessel); @endphp

<div class="bg-white rounded-xl border border-[#E2E8F0] shadow-sm border-l-4 border-l-[#CFA030] p-4 mb-5 flex items-center justify-between">
    <div>
        <h1 class="text-2xl font-bold text-[#0D1F3C]">{{ $isEdit ? 'Modifier — ' . $vessel->nom_navire : 'Nouveau Navire' }}</h1>
        <p class="text-sm text-[#6B7280]">{{ $isEdit ? 'Mise à jour des informations du navire' : 'Enregistrement d\'un nouveau navire' }}</p>
    </div>
    <img src="{{ asset('images/nashco_logo Company.jpg') }}" alt="NASHCO" class="h-12 w-auto rounded-lg">
</div>

<form method="POST" action="{{ $isEdit ? route('blade.commercial.vessels.update', $vessel->id) : route('blade.commercial.vessels.store') }}">
    @csrf
    @if($isEdit) @method('PUT') @endif

    <div class="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden mb-5">
        <div class="bg-[#F0F4F8] border-b border-[#E2E8F0] px-5 py-3">
            <h2 class="text-sm font-bold text-[#0D1F3C] uppercase tracking-wider flex items-center gap-2">
                <i class="fas fa-ship text-[#CFA030]"></i> Informations du Navire
            </h2>
        </div>
        <div class="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">

            <div>
                <label class="text-sm font-medium text-[#374151] mb-1 block">Nom du navire <span class="text-red-500">*</span></label>
                <input type="text" name="nom_navire" value="{{ old('nom_navire', $vessel->nom_navire ?? '') }}" required
                       class="w-full border {{ $errors->has('nom_navire') ? 'border-red-400' : 'border-[#CBD5E1]' }} rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4A8C] bg-white">
                @error('nom_navire')<p class="text-red-600 text-xs mt-1">{{ $message }}</p>@enderror
            </div>

            <div>
                <label class="text-sm font-medium text-[#374151] mb-1 block">Numéro IMO <span class="text-red-500">*</span></label>
                <input type="text" name="numero_imo" value="{{ old('numero_imo', $vessel->numero_imo ?? '') }}" required
                       placeholder="ex: IMO1234567"
                       class="w-full border {{ $errors->has('numero_imo') ? 'border-red-400' : 'border-[#CBD5E1]' }} rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#1A4A8C] bg-white">
                @error('numero_imo')<p class="text-red-600 text-xs mt-1">{{ $message }}</p>@enderror
            </div>

            <div>
                <label class="text-sm font-medium text-[#374151] mb-1 block">Compagnie maritime</label>
                <input type="text" name="compagnie_maritime" value="{{ old('compagnie_maritime', $vessel->compagnie_maritime ?? '') }}"
                       placeholder="ex: CMA CGM, MSC, Maersk..."
                       class="w-full border {{ $errors->has('compagnie_maritime') ? 'border-red-400' : 'border-[#CBD5E1]' }} rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4A8C] bg-white">
                @error('compagnie_maritime')<p class="text-red-600 text-xs mt-1">{{ $message }}</p>@enderror
            </div>

            <div>
                <label class="text-sm font-medium text-[#374151] mb-1 block">Pavillon (pays d'immatriculation)</label>
                <select name="pays_id" class="w-full border {{ $errors->has('pays_id') ? 'border-red-400' : 'border-[#CBD5E1]' }} rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4A8C] bg-white">
                    <option value="">-- Aucun --</option>
                    @foreach($pays as $p)
                    <option value="{{ $p->id }}" {{ old('pays_id', $vessel->pays_id ?? '') == $p->id ? 'selected' : '' }}>{{ $p->nom_pays }}</option>
                    @endforeach
                </select>
                @error('pays_id')<p class="text-red-600 text-xs mt-1">{{ $message }}</p>@enderror
            </div>

            <div>
                <label class="text-sm font-medium text-[#374151] mb-1 block">Capacité (TEU) <span class="text-red-500">*</span></label>
                <input type="number" name="capacite_teu" value="{{ old('capacite_teu', $vessel->capacite_teu ?? '') }}" required min="1"
                       class="w-full border {{ $errors->has('capacite_teu') ? 'border-red-400' : 'border-[#CBD5E1]' }} rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4A8C] bg-white">
                @error('capacite_teu')<p class="text-red-600 text-xs mt-1">{{ $message }}</p>@enderror
            </div>

            <div>
                <label class="text-sm font-medium text-[#374151] mb-1 block">Année de construction</label>
                <input type="number" name="annee_construction" value="{{ old('annee_construction', $vessel->annee_construction ?? '') }}"
                       min="1900" max="{{ date('Y') }}" placeholder="{{ date('Y') }}"
                       class="w-full border {{ $errors->has('annee_construction') ? 'border-red-400' : 'border-[#CBD5E1]' }} rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4A8C] bg-white">
                @error('annee_construction')<p class="text-red-600 text-xs mt-1">{{ $message }}</p>@enderror
            </div>

            <div class="md:col-span-2">
                <label class="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" name="actif" value="1" {{ old('actif', $vessel->actif ?? true) ? 'checked' : '' }}
                           class="w-4 h-4 text-[#1A4A8C] border-[#CBD5E1] rounded focus:ring-[#1A4A8C]">
                    <span class="text-sm font-medium text-[#374151]">Navire actif (disponible pour les escales)</span>
                </label>
            </div>
        </div>
    </div>

    <div class="flex items-center gap-3">
        <button type="submit" class="bg-[#0D1F3C] text-white hover:bg-[#1A4A8C] rounded-lg px-6 py-2.5 text-sm font-medium transition-colors flex items-center gap-2">
            <i class="fas fa-save"></i> {{ $isEdit ? 'Enregistrer les modifications' : 'Ajouter le navire' }}
        </button>
        <a href="{{ route('blade.commercial.vessels') }}"
           class="bg-white border border-[#CBD5E1] text-[#0D1F3C] hover:bg-[#F0F4F8] rounded-lg px-4 py-2.5 text-sm transition-colors">
            Annuler
        </a>
    </div>
</form>

@endsection
