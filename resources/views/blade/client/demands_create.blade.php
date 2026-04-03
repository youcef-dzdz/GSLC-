@extends('layouts.gslc')
@section('page_title', 'Nouvelle demande')

@section('content')

<div class="bg-white rounded-xl border border-[#E2E8F0] shadow-sm border-l-4 border-l-[#CFA030] p-4 mb-5 flex items-center justify-between">
    <div>
        <h1 class="text-2xl font-bold text-[#0D1F3C]">Soumettre une demande d'importation</h1>
        <p class="text-sm text-[#6B7280]">Portail client NASHCO</p>
    </div>
    <div class="flex items-center gap-3">
        <a href="{{ route('client.demands') }}"
           class="bg-white border border-[#CBD5E1] text-[#0D1F3C] hover:bg-[#F0F4F8] rounded-lg px-3 py-2 text-sm transition-colors flex items-center gap-2">
            <i class="fas fa-arrow-left text-[#CFA030]"></i> Retour
        </a>
        <img src="{{ asset('images/nashco_logo Company.jpg') }}" alt="NASHCO" class="h-12 w-auto rounded-lg">
    </div>
</div>

<div class="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-6 max-w-2xl">
    <form method="POST" action="{{ route('client.demands.store') }}">
        @csrf

        <div class="space-y-4">

            <div>
                <label class="block text-sm font-medium text-[#374151] mb-2">Type d'achat <span class="text-red-500">*</span></label>
                <div class="grid grid-cols-2 gap-3">
                    @foreach(['COMPLET' => ['label' => 'Chargement complet', 'sub' => 'FCL — Conteneur entier', 'icon' => 'fa-box'],
                               'GROUPAGE' => ['label' => 'Groupage', 'sub' => 'LCL — Marchandises groupées', 'icon' => 'fa-boxes']] as $val => $info)
                    <label class="cursor-pointer">
                        <input type="radio" name="type_achat" value="{{ $val }}" class="sr-only peer"
                               {{ old('type_achat') === $val ? 'checked' : '' }} required>
                        <div class="border-2 border-[#E2E8F0] rounded-xl p-4 peer-checked:border-[#CFA030] peer-checked:bg-amber-50 transition-colors">
                            <div class="flex items-center gap-2 mb-1">
                                <i class="fas {{ $info['icon'] }} text-[#CFA030]"></i>
                                <span class="text-sm font-semibold text-[#0D1F3C]">{{ $info['label'] }}</span>
                            </div>
                            <p class="text-xs text-[#6B7280]">{{ $info['sub'] }}</p>
                        </div>
                    </label>
                    @endforeach
                </div>
                @error('type_achat')<p class="text-red-500 text-xs mt-1">{{ $message }}</p>@enderror
            </div>

            <div>
                <label class="block text-sm font-medium text-[#374151] mb-2">Priorité <span class="text-red-500">*</span></label>
                <div class="flex gap-4">
                    @foreach(['NORMALE' => 'Normale', 'URGENTE' => 'Urgente'] as $val => $label)
                    <label class="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="priorite" value="{{ $val }}"
                               {{ old('priorite', 'NORMALE') === $val ? 'checked' : '' }}
                               class="text-[#1A4A8C] focus:ring-[#1A4A8C]" required>
                        <span class="text-sm text-[#374151] {{ $val === 'URGENTE' ? 'font-semibold text-red-600' : '' }}">
                            {{ $val === 'URGENTE' ? '⚠ ' : '' }}{{ $label }}
                        </span>
                    </label>
                    @endforeach
                </div>
                @error('priorite')<p class="text-red-500 text-xs mt-1">{{ $message }}</p>@enderror
            </div>

            <div>
                <label class="block text-sm font-medium text-[#374151] mb-1">Date de livraison souhaitée</label>
                <input type="date" name="date_livraison_souhaitee"
                       value="{{ old('date_livraison_souhaitee') }}"
                       min="{{ now()->addDay()->format('Y-m-d') }}"
                       class="w-full border border-[#CBD5E1] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4A8C] bg-white @error('date_livraison_souhaitee') border-red-400 @enderror">
                @error('date_livraison_souhaitee')<p class="text-red-500 text-xs mt-1">{{ $message }}</p>@enderror
            </div>

            <div>
                <label class="block text-sm font-medium text-[#374151] mb-1">Notes / Informations complémentaires</label>
                <textarea name="notes_client" rows="4"
                          placeholder="Décrivez vos marchandises, contraintes particulières, ports souhaités..."
                          class="w-full border border-[#CBD5E1] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4A8C] bg-white resize-none @error('notes_client') border-red-400 @enderror">{{ old('notes_client') }}</textarea>
                @error('notes_client')<p class="text-red-500 text-xs mt-1">{{ $message }}</p>@enderror
            </div>
        </div>

        <div class="mt-6 pt-4 border-t border-[#E2E8F0] flex items-center gap-3">
            <button type="submit"
                    class="bg-[#CFA030] hover:bg-[#b8881f] text-white rounded-lg px-5 py-2 text-sm font-medium transition-colors flex items-center gap-2">
                <i class="fas fa-paper-plane"></i> Soumettre la demande
            </button>
            <a href="{{ route('client.demands') }}" class="text-[#6B7280] hover:text-[#0D1F3C] text-sm transition-colors">Annuler</a>
        </div>
    </form>
</div>

@endsection
