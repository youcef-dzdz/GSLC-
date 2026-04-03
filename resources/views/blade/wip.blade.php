@extends('layouts.gslc')
@section('page_title', $page)
@section('content')
<div class="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-12 text-center">
    <i class="fas fa-tools fa-3x text-[#CBD5E1] mb-4"></i>
    <p class="text-2xl font-bold text-[#0D1F3C] mb-2">{{ $page }}</p>
    <p class="text-[#6B7280] text-sm">Cette page sera disponible prochainement.</p>
    <a href="javascript:history.back()"
       class="mt-6 inline-block bg-[#0D1F3C] text-white rounded-lg px-4 py-2 text-sm hover:bg-[#1A4A8C] transition-colors">
        ← Retour
    </a>
</div>
@endsection
