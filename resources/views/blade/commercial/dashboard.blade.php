@extends('layouts.gslc')
@section('page_title', 'Tableau de bord')

@section('content')

    @php
        // --- INLINE DICTIONARY ---
        $dict = [
            'fr' => [
                'page_title' => 'Tableau de bord',
                'title' => 'Tableau de bord — Commercial',
                'subtitle' => 'NASHCO — Activité commerciale',
                'stat_clients' => 'Clients actifs',
                'stat_clients_desc' => 'Comptes approuvés',
                'stat_demands' => 'Demandes actives',
                'stat_demands_desc' => 'Soumises / En cours',
                'stat_quotes' => 'Devis ouverts',
                'stat_quotes_desc' => 'Envoyés / Négociation',
                'stat_contracts' => 'Contrats actifs',
                'stat_contracts_desc' => 'En vigueur',
                'pending' => 'En attente',
                'ql_title' => 'Accès rapides',
                'ql_new_client' => 'Nouveau client',
                'ql_view_demands' => 'Voir demandes',
                'ql_create_quote' => 'Créer un devis',
                'ql_vessels' => 'Navires',
            ],
            'en' => [
                'page_title' => 'Dashboard',
                'title' => 'Dashboard — Commercial',
                'subtitle' => 'NASHCO — Commercial Activity',
                'stat_clients' => 'Active Clients',
                'stat_clients_desc' => 'Approved accounts',
                'stat_demands' => 'Active Demands',
                'stat_demands_desc' => 'Submitted / In progress',
                'stat_quotes' => 'Open Quotes',
                'stat_quotes_desc' => 'Sent / Negotiation',
                'stat_contracts' => 'Active Contracts',
                'stat_contracts_desc' => 'Currently in effect',
                'pending' => 'Pending',
                'ql_title' => 'Quick Access',
                'ql_new_client' => 'New Client',
                'ql_view_demands' => 'View Demands',
                'ql_create_quote' => 'Create a Quote',
                'ql_vessels' => 'Vessels',
            ],
            'ar' => [
                'page_title' => 'لوحة القيادة',
                'title' => 'لوحة القيادة — الوكيل التجاري',
                'subtitle' => 'NASHCO — النشاط التجاري',
                'stat_clients' => 'العملاء النشطون',
                'stat_clients_desc' => 'الحسابات المعتمدة',
                'stat_demands' => 'الطلبات النشطة',
                'stat_demands_desc' => 'مُقدمة / قيد المعالجة',
                'stat_quotes' => 'عروض الأسعار',
                'stat_quotes_desc' => 'مُرسلة / قيد التفاوض',
                'stat_contracts' => 'العقود النشطة',
                'stat_contracts_desc' => 'سارية المفعول',
                'pending' => 'قيد الانتظار',
                'ql_title' => 'وصول سريع',
                'ql_new_client' => 'عميل جديد',
                'ql_view_demands' => 'عرض الطلبات',
                'ql_create_quote' => 'إنشاء عرض سعر',
                'ql_vessels' => 'السفن',
            ],
        ];

        // Fetch locale strictly from the session to match the layout logic
        $locale = session('gslc_lang', 'fr');
        if (!array_key_exists($locale, $dict)) {
            $locale = 'fr';
        }

        $t = $dict[$locale];
        $isRtl = $locale === 'ar';
    @endphp

    {{-- Self-contained styles for animations and typography --}}
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@700;800&display=swap');

        .dash-wrap {
            font-family: 'Inter', sans-serif;
        }

        .dash-title {
            font-family: 'Plus Jakarta Sans', sans-serif;
        }

        /* Safely override Arabic fonts WITHOUT breaking FontAwesome icons */
        .dash-wrap.font-arabic,
        .dash-wrap.font-arabic *:not(i):not(.fas):not(.far):not(.fab):not(.fa-solid) {
            font-family: 'Cairo', sans-serif !important;
        }

        @keyframes fadeUp {
            from {
                opacity: 0;
                transform: translateY(15px);
            }

            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .animate-fade-up {
            animation: fadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .delay-100 {
            animation-delay: 100ms;
            opacity: 0;
        }

        .delay-200 {
            animation-delay: 200ms;
            opacity: 0;
        }

        .delay-300 {
            animation-delay: 300ms;
            opacity: 0;
        }
    </style>

    <div class="dash-wrap {{ $isRtl ? 'font-arabic' : '' }}" dir="{{ $isRtl ? 'rtl' : 'ltr' }}">

        {{-- Header & Language Switcher --}}
        <div
            class="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-6 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between relative overflow-hidden animate-fade-up">
            {{-- Gold Accent Line --}}
            <div class="absolute top-0 bottom-0 w-1.5 bg-[#CFA030] {{ $isRtl ? 'right-0' : 'left-0' }}"></div>

            <div class="flex items-center gap-5 mb-4 md:mb-0 {{ $isRtl ? 'pr-4' : 'pl-4' }}">
                <div class="hidden sm:block p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl">
                    <img src="{{ asset('images/nashco_logo Company.jpg') }}" alt="NASHCO"
                        class="h-10 w-auto object-contain">
                </div>
                <div>
                    <h1 class="dash-title text-2xl font-extrabold text-[#0D1F3C] tracking-tight mb-1">
                        {{ $t['title'] }}
                    </h1>
                    <p class="text-sm font-medium text-[#6B7280]">
                        {{ $t['subtitle'] }}
                    </p>
                </div>
            </div>

            {{-- Language Switcher Form - Updated to match Sidebar Logic! --}}
            <div class="flex items-center bg-[#F8FAFC] p-1 rounded-lg border border-[#E2E8F0]">
                @foreach(['fr' => 'FR', 'en' => 'EN', 'ar' => 'العربية'] as $langKey => $langLabel)
                    <form method="POST" action="{{ route('blade.lang') }}" class="m-0">
                        @csrf
                        <input type="hidden" name="lang" value="{{ $langKey }}">
                        <button type="submit"
                            class="px-4 py-1.5 text-sm font-semibold rounded-md transition-all duration-200 {{ $locale === $langKey ? 'bg-white text-[#1A4A8C] shadow-sm border border-[#E2E8F0]' : 'text-[#6B7280] hover:text-[#0D1F3C] hover:bg-[#E2E8F0]/50' }}">
                            {{ $langLabel }}
                        </button>
                    </form>
                @endforeach
            </div>
        </div>

        {{-- Stats Grid --}}
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">

            {{-- Stat Card: Clients --}}
            <a href="{{ route('blade.commercial.clients') }}"
                class="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-5 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-md hover:border-[#1A4A8C] group animate-fade-up delay-100">
                <div class="flex items-start justify-between mb-4">
                    <div
                        class="w-12 h-12 rounded-xl bg-[#EBF4FF] flex items-center justify-center group-hover:bg-[#1A4A8C] transition-colors duration-300">
                        <i
                            class="fas fa-building text-lg text-[#1A4A8C] group-hover:text-white transition-colors duration-300"></i>
                    </div>
                    <span
                        class="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                        <i class="fas fa-arrow-trend-up text-[10px]"></i> +12%
                    </span>
                </div>
                <div>
                    <p class="text-3xl font-extrabold text-[#0D1F3C] mb-1">{{ $stats['clients'] ?? 0 }}</p>
                    <h3 class="text-sm font-bold text-[#0D1F3C] uppercase tracking-wide">{{ $t['stat_clients'] }}</h3>
                    <p class="text-xs text-[#94A3B8] mt-1">{{ $t['stat_clients_desc'] }}</p>
                </div>
            </a>

            {{-- Stat Card: Demands --}}
            <a href="{{ route('blade.commercial.demands') }}"
                class="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-5 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-md hover:border-[#CFA030] group animate-fade-up delay-200">
                <div class="flex items-start justify-between mb-4">
                    <div
                        class="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center group-hover:bg-[#CFA030] transition-colors duration-300">
                        <i
                            class="fas fa-inbox text-lg text-[#CFA030] group-hover:text-white transition-colors duration-300"></i>
                    </div>
                    <span
                        class="inline-flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-md">
                        <i class="fas fa-clock text-[10px]"></i> {{ $t['pending'] }}
                    </span>
                </div>
                <div>
                    <p class="text-3xl font-extrabold text-[#0D1F3C] mb-1">{{ $stats['demandes'] ?? 0 }}</p>
                    <h3 class="text-sm font-bold text-[#0D1F3C] uppercase tracking-wide">{{ $t['stat_demands'] }}</h3>
                    <p class="text-xs text-[#94A3B8] mt-1">{{ $t['stat_demands_desc'] }}</p>
                </div>
            </a>

            {{-- Stat Card: Quotes --}}
            <a href="{{ route('blade.commercial.quotes') }}"
                class="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-5 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-md hover:border-blue-400 group animate-fade-up delay-300">
                <div class="flex items-start justify-between mb-4">
                    <div
                        class="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center group-hover:bg-blue-500 transition-colors duration-300">
                        <i
                            class="fas fa-file-invoice-dollar text-lg text-blue-600 group-hover:text-white transition-colors duration-300"></i>
                    </div>
                    <span
                        class="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                        <i class="fas fa-arrow-trend-up text-[10px]"></i> +5%
                    </span>
                </div>
                <div>
                    <p class="text-3xl font-extrabold text-[#0D1F3C] mb-1">{{ $stats['devis'] ?? 0 }}</p>
                    <h3 class="text-sm font-bold text-[#0D1F3C] uppercase tracking-wide">{{ $t['stat_quotes'] }}</h3>
                    <p class="text-xs text-[#94A3B8] mt-1">{{ $t['stat_quotes_desc'] }}</p>
                </div>
            </a>

            {{-- Stat Card: Contracts --}}
            <a href="{{ route('blade.commercial.contracts') }}"
                class="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-5 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-md hover:border-emerald-500 group animate-fade-up delay-300">
                <div class="flex items-start justify-between mb-4">
                    <div
                        class="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-600 transition-colors duration-300">
                        <i
                            class="fas fa-file-signature text-lg text-emerald-600 group-hover:text-white transition-colors duration-300"></i>
                    </div>
                </div>
                <div>
                    <p class="text-3xl font-extrabold text-[#0D1F3C] mb-1">{{ $stats['contrats'] ?? 0 }}</p>
                    <h3 class="text-sm font-bold text-[#0D1F3C] uppercase tracking-wide">{{ $t['stat_contracts'] }}</h3>
                    <p class="text-xs text-[#94A3B8] mt-1">{{ $t['stat_contracts_desc'] }}</p>
                </div>
            </a>
        </div>

        {{-- Quick Links Section --}}
        <div class="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-6 lg:p-8 animate-fade-up delay-300">
            <div class="flex items-center gap-3 mb-6 border-b border-[#E2E8F0] pb-4">
                <div class="w-8 h-8 rounded-full bg-[#CFA030]/10 flex items-center justify-center">
                    <i class="fas fa-bolt text-[#CFA030] text-sm"></i>
                </div>
                <h2 class="text-lg font-bold text-[#0D1F3C]">
                    {{ $t['ql_title'] }}
                </h2>
            </div>

            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
                @php
                    $quickLinks = [
                        ['route' => 'blade.commercial.clients.create', 'icon' => 'fa-user-plus', 'label' => $t['ql_new_client'], 'bg' => 'bg-[#EBF4FF]', 'text' => 'text-[#1A4A8C]', 'hover' => 'hover:border-[#1A4A8C]'],
                        ['route' => 'blade.commercial.demands', 'icon' => 'fa-inbox', 'label' => $t['ql_view_demands'], 'bg' => 'bg-amber-50', 'text' => 'text-[#CFA030]', 'hover' => 'hover:border-[#CFA030]'],
                        ['route' => 'blade.commercial.quotes.create', 'icon' => 'fa-file-invoice', 'label' => $t['ql_create_quote'], 'bg' => 'bg-blue-50', 'text' => 'text-blue-600', 'hover' => 'hover:border-blue-500'],
                        ['route' => 'blade.commercial.vessels', 'icon' => 'fa-ship', 'label' => $t['ql_vessels'], 'bg' => 'bg-slate-100', 'text' => 'text-slate-600', 'hover' => 'hover:border-slate-500'],
                    ];
                @endphp

                @foreach($quickLinks as $link)
                    <a href="{{ route($link['route']) }}"
                        class="group flex flex-col items-center justify-center p-5 rounded-2xl border-2 border-dashed border-[#E2E8F0] bg-[#F8FAFC] transition-all duration-300 {{ $link['hover'] }} hover:bg-white hover:shadow-sm">
                        <div
                            class="w-14 h-14 rounded-2xl {{ $link['bg'] }} {{ $link['text'] }} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                            <i class="fas {{ $link['icon'] }} text-xl"></i>
                        </div>
                        <span class="text-sm font-bold text-[#0D1F3C] text-center">
                            {{ $link['label'] }}
                        </span>
                    </a>
                @endforeach
            </div>
        </div>

    </div>

@endsection