@extends('layouts.gslc')
@section('page_title', 'Nouveau Devis')

@section('content')

<div class="bg-white rounded-xl border border-[#E2E8F0] shadow-sm border-l-4 border-l-[#CFA030] p-4 mb-5 flex items-center justify-between">
    <div>
        <h1 class="text-2xl font-bold text-[#0D1F3C]">Nouveau Devis</h1>
        <p class="text-sm text-[#6B7280]">Créer un devis lié à une demande d'importation</p>
    </div>
    <img src="{{ asset('images/nashco_logo Company.jpg') }}" alt="NASHCO" class="h-12 w-auto rounded-lg">
</div>

<form method="POST" action="{{ route('blade.commercial.quotes.store') }}">
    @csrf

    <div class="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden mb-5">
        <div class="bg-[#F0F4F8] border-b border-[#E2E8F0] px-5 py-3">
            <h2 class="text-sm font-bold text-[#0D1F3C] uppercase tracking-wider flex items-center gap-2">
                <i class="fas fa-file-invoice text-[#CFA030]"></i> Informations du Devis
            </h2>
        </div>
        <div class="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">

            <div class="md:col-span-2">
                <label class="text-sm font-medium text-[#374151] mb-1 block">Demande d'importation <span class="text-red-500">*</span></label>
                <select name="demande_id" required class="w-full border {{ $errors->has('demande_id') ? 'border-red-400' : 'border-[#CBD5E1]' }} rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4A8C] bg-white">
                    <option value="">-- Sélectionner une demande --</option>
                    @foreach($demands as $d)
                    <option value="{{ $d->id }}" {{ old('demande_id') == $d->id ? 'selected' : '' }}>
                        {{ $d->numero_dossier }} — {{ $d->client?->raison_sociale }}
                    </option>
                    @endforeach
                </select>
                @error('demande_id')<p class="text-red-600 text-xs mt-1">{{ $message }}</p>@enderror
            </div>

            <div>
                <label class="text-sm font-medium text-[#374151] mb-1 block">Montant HT (DZD) <span class="text-red-500">*</span></label>
                <input type="number" step="0.01" name="montant_ht" value="{{ old('montant_ht') }}" required min="0"
                       class="w-full border {{ $errors->has('montant_ht') ? 'border-red-400' : 'border-[#CBD5E1]' }} rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4A8C] bg-white">
                @error('montant_ht')<p class="text-red-600 text-xs mt-1">{{ $message }}</p>@enderror
            </div>

            <div>
                <label class="text-sm font-medium text-[#374151] mb-1 block">TVA (DZD) <span class="text-red-500">*</span></label>
                <input type="number" step="0.01" name="tva" value="{{ old('tva') }}" required min="0"
                       class="w-full border {{ $errors->has('tva') ? 'border-red-400' : 'border-[#CBD5E1]' }} rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4A8C] bg-white">
                @error('tva')<p class="text-red-600 text-xs mt-1">{{ $message }}</p>@enderror
            </div>

            <div>
                <label class="text-sm font-medium text-[#374151] mb-1 block">Total TTC (DZD) <span class="text-red-500">*</span></label>
                <input type="number" step="0.01" name="total_ttc" value="{{ old('total_ttc') }}" required min="0"
                       class="w-full border {{ $errors->has('total_ttc') ? 'border-red-400' : 'border-[#CBD5E1]' }} rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4A8C] bg-white">
                @error('total_ttc')<p class="text-red-600 text-xs mt-1">{{ $message }}</p>@enderror
            </div>

            <div>
                <label class="text-sm font-medium text-[#374151] mb-1 block">Date d'expiration</label>
                <input type="date" name="date_expiration" value="{{ old('date_expiration') }}"
                       class="w-full border {{ $errors->has('date_expiration') ? 'border-red-400' : 'border-[#CBD5E1]' }} rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4A8C] bg-white">
                @error('date_expiration')<p class="text-red-600 text-xs mt-1">{{ $message }}</p>@enderror
            </div>

            <div class="md:col-span-2">
                <label class="text-sm font-medium text-[#374151] mb-1 block">Commentaire NASHCO</label>
                <textarea name="commentaire_nashco" rows="3" placeholder="Notes internes ou conditions particulières..."
                          class="w-full border {{ $errors->has('commentaire_nashco') ? 'border-red-400' : 'border-[#CBD5E1]' }} rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4A8C] bg-white resize-none">{{ old('commentaire_nashco') }}</textarea>
                @error('commentaire_nashco')<p class="text-red-600 text-xs mt-1">{{ $message }}</p>@enderror
            </div>
        </div>
    </div>

    <div class="flex items-center gap-3">
        <button type="submit" class="bg-[#0D1F3C] text-white hover:bg-[#1A4A8C] rounded-lg px-6 py-2.5 text-sm font-medium transition-colors flex items-center gap-2">
            <i class="fas fa-save"></i> Créer le devis
        </button>
        <a href="{{ route('blade.commercial.quotes') }}"
           class="bg-white border border-[#CBD5E1] text-[#0D1F3C] hover:bg-[#F0F4F8] rounded-lg px-4 py-2.5 text-sm transition-colors">
            Annuler
        </a>
    </div>
</form>

@endsection
