@extends('layouts.gslc')
@section('page_title', $demand->numero_dossier)

@section('content')

<div class="bg-white rounded-xl border border-[#E2E8F0] shadow-sm border-l-4 border-l-[#CFA030] p-4 mb-5 flex items-center justify-between">
    <div>
        <div class="flex items-center gap-3 mb-1">
            <h1 class="text-2xl font-bold text-[#0D1F3C] font-mono">{{ $demand->numero_dossier }}</h1>
            @php
                $statColor = match($demand->statut) {
                    'SOUMISE','EN_COURS' => 'bg-amber-50 text-amber-700',
                    'ACCEPTEE','TERMINEE'=> 'bg-emerald-50 text-emerald-700',
                    'REJETEE','ANNULEE'  => 'bg-red-50 text-red-700',
                    default              => 'bg-blue-50 text-blue-700',
                };
            @endphp
            <span class="inline-flex px-2 py-1 rounded-full text-xs font-medium {{ $statColor }}">
                {{ str_replace('_', ' ', $demand->statut) }}
            </span>
            @if($demand->priorite === 'URGENTE')
            <span class="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700">⚡ URGENTE</span>
            @endif
        </div>
        <p class="text-sm text-[#6B7280]">{{ $demand->client?->raison_sociale }} — {{ $demand->type_achat }}</p>
    </div>
    <img src="{{ asset('images/nashco_logo Company.jpg') }}" alt="NASHCO" class="h-12 w-auto rounded-lg">
</div>

<div class="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
    {{-- Demand details --}}
    <div class="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">
        <div class="bg-[#F0F4F8] border-b border-[#E2E8F0] px-5 py-3">
            <h2 class="text-sm font-bold text-[#0D1F3C] uppercase tracking-wider">Détails de la Demande</h2>
        </div>
        <div class="p-5 space-y-3">
            <div class="grid grid-cols-2 gap-3">
                <div>
                    <p class="text-xs text-[#94A3B8] uppercase tracking-wider">Type d'achat</p>
                    <p class="text-sm font-medium text-[#0D1F3C]">{{ $demand->type_achat }}</p>
                </div>
                <div>
                    <p class="text-xs text-[#94A3B8] uppercase tracking-wider">Date soumission</p>
                    <p class="text-sm font-medium text-[#0D1F3C]">{{ $demand->date_soumission->format('d/m/Y H:i') }}</p>
                </div>
                @if($demand->date_livraison_souhaitee)
                <div>
                    <p class="text-xs text-[#94A3B8] uppercase tracking-wider">Livraison souhaitée</p>
                    <p class="text-sm font-medium text-[#0D1F3C]">{{ \Carbon\Carbon::parse($demand->date_livraison_souhaitee)->format('d/m/Y') }}</p>
                </div>
                @endif
                <div>
                    <p class="text-xs text-[#94A3B8] uppercase tracking-wider">Négociations</p>
                    <p class="text-sm font-medium text-[#0D1F3C]">{{ $demand->nombre_negociations }} / 3</p>
                </div>
            </div>
            @if($demand->notes_client)
            <div>
                <p class="text-xs text-[#94A3B8] uppercase tracking-wider mb-1">Notes client</p>
                <p class="text-sm text-[#4B5563] bg-[#F8FAFC] rounded-lg p-3">{{ $demand->notes_client }}</p>
            </div>
            @endif
            @if($demand->motif_rejet)
            <div>
                <p class="text-xs text-red-400 uppercase tracking-wider mb-1">Motif de rejet</p>
                <p class="text-sm text-red-600 bg-red-50 rounded-lg p-3">{{ $demand->motif_rejet }}</p>
            </div>
            @endif
            @if($demand->traitePar)
            <div class="pt-2 border-t border-[#E2E8F0]">
                <p class="text-xs text-[#94A3B8]">Traité par {{ $demand->traitePar->prenom }} {{ $demand->traitePar->nom }}</p>
            </div>
            @endif
        </div>
    </div>

    {{-- Client info --}}
    <div class="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">
        <div class="bg-[#F0F4F8] border-b border-[#E2E8F0] px-5 py-3">
            <h2 class="text-sm font-bold text-[#0D1F3C] uppercase tracking-wider">Informations Client</h2>
        </div>
        <div class="p-5 space-y-3">
            @if($demand->client)
            <div>
                <p class="font-semibold text-[#0D1F3C]">{{ $demand->client->raison_sociale }}</p>
                <p class="text-sm text-[#6B7280]">{{ $demand->client->rep_prenom }} {{ $demand->client->rep_nom }}</p>
            </div>
            <div class="space-y-1.5">
                <div class="flex items-center gap-2 text-sm text-[#4B5563]">
                    <i class="fas fa-envelope text-[#94A3B8] w-4"></i> {{ $demand->client->rep_email }}
                </div>
                <div class="flex items-center gap-2 text-sm text-[#4B5563]">
                    <i class="fas fa-phone text-[#94A3B8] w-4"></i> {{ $demand->client->rep_tel }}
                </div>
            </div>
            <div class="pt-2">
                <a href="{{ route('blade.commercial.clients.show', $demand->client->id) }}"
                   class="text-xs text-[#1A4A8C] hover:underline flex items-center gap-1">
                    <i class="fas fa-external-link-alt"></i> Voir fiche client
                </a>
            </div>
            @endif
        </div>
    </div>
</div>

{{-- Linked quotes --}}
@if($demand->devis && $demand->devis->isNotEmpty())
<div class="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden mb-5">
    <div class="bg-[#F0F4F8] border-b border-[#E2E8F0] px-5 py-3">
        <h2 class="text-sm font-bold text-[#0D1F3C] uppercase tracking-wider flex items-center gap-2">
            <i class="fas fa-file-invoice text-[#CFA030]"></i> Devis associés
        </h2>
    </div>
    <table class="w-full">
        <thead class="bg-[#EDF2F7]">
            <tr>
                <th class="text-left text-xs font-semibold text-[#0D1F3C] uppercase px-4 py-2">N° Devis</th>
                <th class="text-left text-xs font-semibold text-[#0D1F3C] uppercase px-4 py-2">Version</th>
                <th class="text-left text-xs font-semibold text-[#0D1F3C] uppercase px-4 py-2">Total TTC</th>
                <th class="text-left text-xs font-semibold text-[#0D1F3C] uppercase px-4 py-2">Statut</th>
                <th class="text-left text-xs font-semibold text-[#0D1F3C] uppercase px-4 py-2">Expiration</th>
            </tr>
        </thead>
        <tbody>
            @foreach($demand->devis as $devis)
            <tr class="border-b border-[#E2E8F0] hover:bg-[#EBF4FF] transition-colors">
                <td class="px-4 py-2.5">
                    <a href="{{ route('blade.commercial.quotes.show', $devis->id) }}" class="font-mono text-xs text-[#1A4A8C] hover:underline">{{ $devis->numero_devis }}</a>
                </td>
                <td class="px-4 py-2.5 text-sm text-[#4B5563]">v{{ $devis->version }}</td>
                <td class="px-4 py-2.5 text-sm font-semibold text-[#0D1F3C]">{{ number_format($devis->total_ttc, 2) }} DZD</td>
                <td class="px-4 py-2.5">
                    <span class="inline-flex px-2 py-0.5 rounded-full text-xs font-medium
                        {{ $devis->statut === 'ACCEPTE' ? 'bg-emerald-50 text-emerald-700' :
                           ($devis->statut === 'REFUSE' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700') }}">
                        {{ $devis->statut }}
                    </span>
                </td>
                <td class="px-4 py-2.5 text-xs text-[#6B7280]">
                    {{ $devis->date_expiration ? \Carbon\Carbon::parse($devis->date_expiration)->format('d/m/Y') : '—' }}
                </td>
            </tr>
            @endforeach
        </tbody>
    </table>
</div>
@endif

<div class="mt-4">
    <a href="{{ route('blade.commercial.demands') }}" class="text-sm text-[#1A4A8C] hover:underline flex items-center gap-1">
        <i class="fas fa-arrow-left text-xs"></i> Retour à la liste
    </a>
</div>

@endsection
