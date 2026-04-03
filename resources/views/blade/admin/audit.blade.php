@extends('layouts.gslc')
@section('page_title', "Journal d'audit")

@section('content')

<div class="bg-white rounded-xl border border-[#E2E8F0] shadow-sm border-l-4 border-l-[#CFA030] p-4 mb-5 flex items-center justify-between">
    <div>
        <h1 class="text-2xl font-bold text-[#0D1F3C]">Journal d'Audit</h1>
        <p class="text-sm text-[#6B7280]">Traçabilité complète des actions — lecture seule</p>
    </div>
    <div class="flex items-center gap-3">
        <a href="{{ route('blade.admin.audit') }}?{{ http_build_query(array_merge(request()->all(), ['export' => 'csv'])) }}"
           class="bg-white border border-[#CBD5E1] text-[#0D1F3C] hover:bg-[#F0F4F8] rounded-lg px-3 py-2 text-sm transition-colors flex items-center gap-2">
            <i class="fas fa-download text-[#CFA030]"></i> Export CSV
        </a>
        <img src="{{ asset('images/nashco_logo Company.jpg') }}" alt="NASHCO" class="h-12 w-auto rounded-lg">
    </div>
</div>

<div class="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-4 mb-4">
    <form method="GET" action="{{ route('blade.admin.audit') }}" class="flex flex-wrap gap-3 items-center">
        <div class="flex-1 min-w-48">
            <input type="text" name="search" value="{{ $search ?? '' }}"
                   placeholder="Description ou table..."
                   class="w-full border border-[#CBD5E1] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4A8C] bg-white">
        </div>
        <select name="action" class="border border-[#CBD5E1] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4A8C] bg-white">
            <option value="">Toutes les actions</option>
            @foreach(['CREATE','UPDATE','DELETE','LOGIN','LOGOUT','APPROVE','REJECT'] as $a)
            <option value="{{ $a }}" {{ $action === $a ? 'selected' : '' }}>{{ $a }}</option>
            @endforeach
        </select>
        <select name="table_name" class="border border-[#CBD5E1] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4A8C] bg-white">
            <option value="">Toutes les tables</option>
            @foreach($tables as $t)
            <option value="{{ $t }}" {{ $table === $t ? 'selected' : '' }}>{{ $t }}</option>
            @endforeach
        </select>
        <input type="date" name="date_from" value="{{ $dateFrom ?? '' }}"
               class="border border-[#CBD5E1] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4A8C] bg-white">
        <input type="date" name="date_to" value="{{ $dateTo ?? '' }}"
               class="border border-[#CBD5E1] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4A8C] bg-white">
        <button type="submit" class="bg-[#0D1F3C] text-white hover:bg-[#1A4A8C] rounded-lg px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2">
            <i class="fas fa-search"></i> Filtrer
        </button>
        @if(request()->hasAny(['search','action','table_name','date_from','date_to']))
        <a href="{{ route('blade.admin.audit') }}" class="text-[#1A4A8C] text-sm hover:underline"><i class="fas fa-times mr-1"></i>Réinitialiser</a>
        @endif
    </form>
</div>

<div class="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">
    <table class="w-full">
        <thead class="bg-[#0D1F3C]">
            <tr>
                <th class="text-left text-xs font-semibold text-white uppercase tracking-wider px-4 py-3">Date/Heure</th>
                <th class="text-left text-xs font-semibold text-white uppercase tracking-wider px-4 py-3">Utilisateur</th>
                <th class="text-left text-xs font-semibold text-white uppercase tracking-wider px-4 py-3">Action</th>
                <th class="text-left text-xs font-semibold text-white uppercase tracking-wider px-4 py-3">Table</th>
                <th class="text-left text-xs font-semibold text-white uppercase tracking-wider px-4 py-3">ID enregistrement</th>
                <th class="text-left text-xs font-semibold text-white uppercase tracking-wider px-4 py-3">Description</th>
            </tr>
        </thead>
        <tbody>
            @forelse($logs as $log)
            @php
                $actionColor = match($log->action ?? '') {
                    'CREATE'  => 'bg-emerald-50 text-emerald-700',
                    'UPDATE'  => 'bg-blue-50 text-blue-700',
                    'DELETE'  => 'bg-red-50 text-red-700',
                    'LOGIN'   => 'bg-slate-100 text-slate-600',
                    'APPROVE' => 'bg-emerald-50 text-emerald-700',
                    'REJECT'  => 'bg-red-50 text-red-700',
                    default   => 'bg-slate-100 text-slate-600',
                };
            @endphp
            <tr class="border-b border-[#E2E8F0] hover:bg-[#EBF4FF] transition-colors">
                <td class="px-4 py-2.5 text-xs text-[#6B7280] font-mono">{{ $log->created_at->format('d/m/Y H:i:s') }}</td>
                <td class="px-4 py-2.5 text-sm text-[#4B5563]">
                    @if($log->user)
                    <span class="font-medium">{{ $log->user->prenom }} {{ $log->user->nom }}</span>
                    @else
                    <span class="text-[#94A3B8]">Système</span>
                    @endif
                </td>
                <td class="px-4 py-2.5">
                    <span class="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold {{ $actionColor }}">
                        {{ $log->action ?? '—' }}
                    </span>
                </td>
                <td class="px-4 py-2.5">
                    <span class="font-mono text-xs bg-[#EDF2F7] text-[#0D1F3C] px-2 py-0.5 rounded">{{ $log->table_name ?? '—' }}</span>
                </td>
                <td class="px-4 py-2.5 font-mono text-xs text-[#94A3B8]">{{ $log->record_id ?? '—' }}</td>
                <td class="px-4 py-2.5 text-xs text-[#4B5563] max-w-xs truncate" title="{{ $log->description ?? '' }}">
                    {{ $log->description ?? '—' }}
                </td>
            </tr>
            @empty
            <tr>
                <td colspan="6" class="py-16 text-center">
                    <i class="fas fa-history fa-4x text-[#CBD5E1] mb-3 block"></i>
                    <p class="text-[#6B7280] font-medium">Aucune entrée dans le journal</p>
                </td>
            </tr>
            @endforelse
        </tbody>
    </table>
</div>

@if($logs->hasPages())
<div class="mt-4">{{ $logs->links() }}</div>
@endif

@endsection
