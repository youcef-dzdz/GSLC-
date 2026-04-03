@extends('layouts.gslc')
@section('page_title', 'Tableau de bord')

@section('content')

<div class="bg-white rounded-xl border border-[#E2E8F0] shadow-sm border-l-4 border-l-[#CFA030] p-4 mb-5 flex items-center justify-between">
    <div>
        <h1 class="text-2xl font-bold text-[#0D1F3C]">Tableau de bord — Administration</h1>
        <p class="text-sm text-[#6B7280]">Vue d'ensemble du système GSLC</p>
    </div>
    <img src="{{ asset('images/nashco_logo Company.jpg') }}" alt="NASHCO" class="h-12 w-auto rounded-lg">
</div>

{{-- Stats --}}
<div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
    <div class="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-4">
        <div class="flex items-center justify-between mb-2">
            <p class="text-xs text-[#6B7280] uppercase tracking-wider">Utilisateurs</p>
            <div class="w-9 h-9 rounded-lg bg-[#EBF4FF] flex items-center justify-center">
                <i class="fas fa-users text-[#1A4A8C]"></i>
            </div>
        </div>
        <p class="text-3xl font-bold text-[#0D1F3C]">{{ $stats['users'] }}</p>
        <p class="text-xs text-[#94A3B8] mt-1">Personnel NASHCO</p>
    </div>

    <div class="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-4">
        <div class="flex items-center justify-between mb-2">
            <p class="text-xs text-[#6B7280] uppercase tracking-wider">Clients actifs</p>
            <div class="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center">
                <i class="fas fa-building text-emerald-600"></i>
            </div>
        </div>
        <p class="text-3xl font-bold text-[#0D1F3C]">{{ $stats['active_clients'] }}</p>
        <p class="text-xs text-[#94A3B8] mt-1">Comptes approuvés</p>
    </div>

    <div class="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-4">
        <div class="flex items-center justify-between mb-2">
            <p class="text-xs text-[#6B7280] uppercase tracking-wider">Total clients</p>
            <div class="w-9 h-9 rounded-lg bg-[#EDF2F7] flex items-center justify-center">
                <i class="fas fa-database text-[#475569]"></i>
            </div>
        </div>
        <p class="text-3xl font-bold text-[#0D1F3C]">{{ $stats['clients'] }}</p>
        <p class="text-xs text-[#94A3B8] mt-1">Tous statuts</p>
    </div>

    <div class="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-4 {{ $stats['pending'] > 0 ? 'border-l-4 border-l-amber-400' : '' }}">
        <div class="flex items-center justify-between mb-2">
            <p class="text-xs text-[#6B7280] uppercase tracking-wider">En attente</p>
            <div class="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center">
                <i class="fas fa-clock text-amber-500"></i>
            </div>
        </div>
        <p class="text-3xl font-bold text-[#0D1F3C]">{{ $stats['pending'] }}</p>
        <p class="text-xs text-[#94A3B8] mt-1">Inscriptions à valider</p>
    </div>
</div>

{{-- Quick Actions --}}
<div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
    <div class="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-5">
        <h3 class="text-sm font-semibold text-[#0D1F3C] mb-4 flex items-center gap-2">
            <i class="fas fa-bolt text-[#CFA030]"></i> Actions rapides
        </h3>
        <div class="space-y-2">
            <a href="{{ route('blade.admin.users.create') }}"
               class="flex items-center gap-3 p-3 rounded-lg hover:bg-[#F0F4F8] transition-colors group">
                <div class="w-8 h-8 rounded-lg bg-[#EBF4FF] flex items-center justify-center group-hover:bg-[#1A4A8C] transition-colors">
                    <i class="fas fa-user-plus text-[#1A4A8C] group-hover:text-white text-xs"></i>
                </div>
                <span class="text-sm text-[#374151]">Créer un utilisateur</span>
                <i class="fas fa-chevron-right text-[#CBD5E1] text-xs ml-auto"></i>
            </a>
            <a href="{{ route('blade.admin.registrations') }}"
               class="flex items-center gap-3 p-3 rounded-lg hover:bg-[#F0F4F8] transition-colors group">
                <div class="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center group-hover:bg-amber-500 transition-colors">
                    <i class="fas fa-clock text-amber-500 group-hover:text-white text-xs"></i>
                </div>
                <span class="text-sm text-[#374151]">Valider les inscriptions</span>
                @if($stats['pending'] > 0)
                <span class="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded-full ml-auto">{{ $stats['pending'] }}</span>
                @else
                <i class="fas fa-chevron-right text-[#CBD5E1] text-xs ml-auto"></i>
                @endif
            </a>
            <a href="{{ route('blade.admin.audit') }}"
               class="flex items-center gap-3 p-3 rounded-lg hover:bg-[#F0F4F8] transition-colors group">
                <div class="w-8 h-8 rounded-lg bg-[#EDF2F7] flex items-center justify-center group-hover:bg-[#475569] transition-colors">
                    <i class="fas fa-history text-[#475569] group-hover:text-white text-xs"></i>
                </div>
                <span class="text-sm text-[#374151]">Journal d'audit</span>
                <i class="fas fa-chevron-right text-[#CBD5E1] text-xs ml-auto"></i>
            </a>
            <a href="{{ route('blade.admin.users') }}"
               class="flex items-center gap-3 p-3 rounded-lg hover:bg-[#F0F4F8] transition-colors group">
                <div class="w-8 h-8 rounded-lg bg-[#EDF2F7] flex items-center justify-center group-hover:bg-[#0D1F3C] transition-colors">
                    <i class="fas fa-users text-[#0D1F3C] group-hover:text-white text-xs"></i>
                </div>
                <span class="text-sm text-[#374151]">Gestion des utilisateurs</span>
                <i class="fas fa-chevron-right text-[#CBD5E1] text-xs ml-auto"></i>
            </a>
        </div>
    </div>

    <div class="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-5">
        <h3 class="text-sm font-semibold text-[#0D1F3C] mb-4 flex items-center gap-2">
            <i class="fas fa-info-circle text-[#CFA030]"></i> Informations système
        </h3>
        <div class="space-y-3">
            <div class="flex justify-between items-center py-2 border-b border-[#F1F5F9]">
                <span class="text-xs text-[#6B7280]">Environnement</span>
                <span class="text-xs font-mono bg-[#EDF2F7] px-2 py-0.5 rounded text-[#0D1F3C]">{{ app()->environment() }}</span>
            </div>
            <div class="flex justify-between items-center py-2 border-b border-[#F1F5F9]">
                <span class="text-xs text-[#6B7280]">Version Laravel</span>
                <span class="text-xs font-mono bg-[#EDF2F7] px-2 py-0.5 rounded text-[#0D1F3C]">{{ app()->version() }}</span>
            </div>
            <div class="flex justify-between items-center py-2 border-b border-[#F1F5F9]">
                <span class="text-xs text-[#6B7280]">Date système</span>
                <span class="text-xs font-mono bg-[#EDF2F7] px-2 py-0.5 rounded text-[#0D1F3C]">{{ now()->format('d/m/Y H:i') }}</span>
            </div>
            <div class="flex justify-between items-center py-2">
                <span class="text-xs text-[#6B7280]">Connecté en tant que</span>
                <span class="text-xs font-medium text-[#0D1F3C]">{{ auth()->user()->prenom }} {{ auth()->user()->nom }}</span>
            </div>
        </div>
    </div>
</div>

@endsection
