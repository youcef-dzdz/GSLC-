@extends('layouts.gslc')
@section('page_title', $container->numero_conteneur)

@section('content')

<div class="bg-white rounded-xl border border-[#E2E8F0] shadow-sm border-l-4 border-l-[#CFA030] p-4 mb-5 flex items-center justify-between">
    <div>
        <div class="flex items-center gap-3 mb-1">
            <h1 class="text-2xl font-bold text-[#0D1F3C] font-mono">{{ $container->numero_conteneur }}</h1>
            @php
                $statutColor = match($container->statut) {
                    'DISPONIBLE' => 'bg-emerald-50 text-emerald-700',
                    'RESERVE' => 'bg-amber-50 text-amber-700',
                    'LIVRAISON_CLIENT' => 'bg-purple-50 text-purple-700',
                    'EN_MAINTENANCE' => 'bg-red-50 text-red-700',
                    default => 'bg-blue-50 text-blue-700',
                };
            @endphp
            <span class="inline-flex px-2 py-1 rounded-full text-xs font-medium {{ $statutColor }}">
                {{ str_replace('_', ' ', $container->statut) }}
            </span>
        </div>
        <p class="text-sm text-[#6B7280]">{{ $container->type?->libelle ?? 'Type inconnu' }} — {{ $container->proprietaire }}</p>
    </div>
    <img src="{{ asset('images/nashco_logo Company.jpg') }}" alt="NASHCO" class="h-12 w-auto rounded-lg">
</div>

{{-- Info + Transition --}}
<div class="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">

    {{-- Container details --}}
    <div class="md:col-span-2 bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">
        <div class="bg-[#F0F4F8] border-b border-[#E2E8F0] px-5 py-3">
            <h2 class="text-sm font-bold text-[#0D1F3C] uppercase tracking-wider flex items-center gap-2">
                <i class="fas fa-box text-[#CFA030]"></i> Détails du Conteneur
            </h2>
        </div>
        <div class="p-5 grid grid-cols-2 gap-4">
            <div>
                <p class="text-xs text-[#94A3B8] uppercase tracking-wider">Type</p>
                <p class="text-sm font-medium text-[#0D1F3C]">{{ $container->type?->code_type }} — {{ $container->type?->libelle }}</p>
            </div>
            <div>
                <p class="text-xs text-[#94A3B8] uppercase tracking-wider">Propriétaire</p>
                <p class="text-sm font-medium text-[#0D1F3C]">{{ $container->proprietaire }}</p>
            </div>
            <div>
                <p class="text-xs text-[#94A3B8] uppercase tracking-wider">État physique</p>
                <p class="text-sm font-medium {{ $container->etat_actuel === 'BON_ETAT' ? 'text-emerald-600' : 'text-red-600' }}">
                    {{ str_replace('_', ' ', $container->etat_actuel) }}
                </p>
            </div>
            @if($container->date_achat)
            <div>
                <p class="text-xs text-[#94A3B8] uppercase tracking-wider">Date d'achat</p>
                <p class="text-sm font-medium text-[#0D1F3C]">{{ \Carbon\Carbon::parse($container->date_achat)->format('d/m/Y') }}</p>
            </div>
            @endif
            @if($container->hauteur || $container->largeur)
            <div>
                <p class="text-xs text-[#94A3B8] uppercase tracking-wider">Dimensions</p>
                <p class="text-sm font-medium text-[#0D1F3C]">
                    H: {{ $container->hauteur }}m / L: {{ $container->largeur }}m
                </p>
            </div>
            @endif
            @if($container->poids_max)
            <div>
                <p class="text-xs text-[#94A3B8] uppercase tracking-wider">Poids max</p>
                <p class="text-sm font-medium text-[#0D1F3C]">{{ $container->poids_max }} t</p>
            </div>
            @endif
            @if($container->temperature !== null)
            <div>
                <p class="text-xs text-[#94A3B8] uppercase tracking-wider">Température (frigo)</p>
                <p class="text-sm font-medium text-blue-600">{{ $container->temperature }}°C</p>
            </div>
            @endif
        </div>
    </div>

    {{-- Status transition --}}
    <div class="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">
        <div class="bg-[#F0F4F8] border-b border-[#E2E8F0] px-5 py-3">
            <h2 class="text-sm font-bold text-[#0D1F3C] uppercase tracking-wider flex items-center gap-2">
                <i class="fas fa-exchange-alt text-[#CFA030]"></i> Changer le Statut
            </h2>
        </div>
        <div class="p-5">
            @if(count($allowedTransitions) > 0 && auth()->user()->hasPermission('containers.transition'))
            <form action="{{ route('blade.logistique.containers.transition', $container->id) }}" method="POST">
                @csrf
                <div class="mb-3">
                    <label class="text-xs font-medium text-[#374151] mb-1 block">Nouveau statut</label>
                    <select name="new_statut" required class="w-full border border-[#CBD5E1] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4A8C] bg-white">
                        <option value="">-- Sélectionner --</option>
                        @foreach($allowedTransitions as $transition)
                        <option value="{{ $transition }}">{{ str_replace('_', ' ', $transition) }}</option>
                        @endforeach
                    </select>
                </div>
                <div class="mb-3">
                    <label class="text-xs font-medium text-[#374151] mb-1 block">Commentaire</label>
                    <textarea name="commentaire" rows="2" placeholder="Optionnel..."
                              class="w-full border border-[#CBD5E1] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4A8C] bg-white resize-none"></textarea>
                </div>
                <button type="submit" class="w-full bg-[#0D1F3C] text-white hover:bg-[#1A4A8C] rounded-lg py-2 text-sm font-medium transition-colors">
                    Appliquer la transition
                </button>
            </form>
            @elseif(count($allowedTransitions) === 0)
            <p class="text-sm text-[#94A3B8] text-center py-4">Aucune transition disponible pour ce statut.</p>
            @else
            <p class="text-sm text-[#94A3B8] text-center py-4">Permission insuffisante.</p>
            @endif
        </div>
    </div>
</div>

{{-- Status history --}}
@if($container->statutHistorique->isNotEmpty())
<div class="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">
    <div class="bg-[#F0F4F8] border-b border-[#E2E8F0] px-5 py-3">
        <h2 class="text-sm font-bold text-[#0D1F3C] uppercase tracking-wider flex items-center gap-2">
            <i class="fas fa-history text-[#CFA030]"></i> Historique des Statuts
        </h2>
    </div>
    <table class="w-full">
        <thead class="bg-[#EDF2F7]">
            <tr>
                <th class="text-left text-xs font-semibold text-[#0D1F3C] uppercase tracking-wider px-4 py-2">Date</th>
                <th class="text-left text-xs font-semibold text-[#0D1F3C] uppercase tracking-wider px-4 py-2">Ancien statut</th>
                <th class="text-left text-xs font-semibold text-[#0D1F3C] uppercase tracking-wider px-4 py-2">Nouveau statut</th>
                <th class="text-left text-xs font-semibold text-[#0D1F3C] uppercase tracking-wider px-4 py-2">Responsable</th>
                <th class="text-left text-xs font-semibold text-[#0D1F3C] uppercase tracking-wider px-4 py-2">Commentaire</th>
            </tr>
        </thead>
        <tbody>
            @foreach($container->statutHistorique as $hist)
            <tr class="border-b border-[#E2E8F0] hover:bg-[#EBF4FF] transition-colors">
                <td class="px-4 py-2.5 text-xs text-[#6B7280]">{{ \Carbon\Carbon::parse($hist->date_changement)->format('d/m/Y H:i') }}</td>
                <td class="px-4 py-2.5 text-xs text-[#94A3B8]">{{ $hist->ancien_statut ? str_replace('_',' ',$hist->ancien_statut) : '—' }}</td>
                <td class="px-4 py-2.5">
                    <span class="text-xs font-semibold text-[#0D1F3C]">{{ str_replace('_', ' ', $hist->nouveau_statut) }}</span>
                </td>
                <td class="px-4 py-2.5 text-sm text-[#4B5563]">{{ $hist->responsable?->prenom }} {{ $hist->responsable?->nom }}</td>
                <td class="px-4 py-2.5 text-xs text-[#6B7280]">{{ $hist->commentaire ?? '—' }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
</div>
@endif

<div class="mt-4">
    <a href="{{ route('blade.logistique.containers') }}" class="text-sm text-[#1A4A8C] hover:underline flex items-center gap-1">
        <i class="fas fa-arrow-left text-xs"></i> Retour à la liste
    </a>
</div>

@endsection
