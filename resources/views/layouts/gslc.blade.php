<!DOCTYPE html>
@php
    $lang = session('gslc_lang', 'fr');
    
    if (!in_array($lang, ['fr', 'en', 'ar'])) {
        $lang = 'fr';
    }

    $isRtl = $lang === 'ar';

    // Inline Translation Dictionary
    $dict = [
        'Dashboard'     => ['fr' => 'Dashboard',    'en' => 'Dashboard',    'ar' => 'لوحة القيادة'],
        'Clients'       => ['fr' => 'Clients',      'en' => 'Customers',    'ar' => 'العملاء'],
        'Demandes'      => ['fr' => 'Demandes',     'en' => 'Requests',     'ar' => 'الطلبات'],
        'Devis'         => ['fr' => 'Devis',        'en' => 'Quotes',       'ar' => 'عروض الأسعار'],
        'Contrats'      => ['fr' => 'Contrats',     'en' => 'Contracts',    'ar' => 'العقود'],
        'Mes Demandes'  => ['fr' => 'Mes Demandes', 'en' => 'My Requests',  'ar' => 'طلباتي'],
        'Déconnexion'   => ['fr' => 'Déconnexion',  'en' => 'Logout',       'ar' => 'تسجيل الخروج'],
        'Pages'         => ['fr' => 'Pages',        'en' => 'Pages',        'ar' => 'الصفحات'],
        'Rechercher...' => ['fr' => 'Rechercher...', 'en' => 'Search...',   'ar' => 'بحث...'],
        'Succès'        => ['fr' => 'Succès',       'en' => 'Success',      'ar' => 'نجاح'],
    ];

    // Translation Helper Function
    $t = function($key) use ($dict, $lang) {
        return $dict[$key][$lang] ?? $key;
    };
@endphp
<html lang="{{ $lang }}" dir="{{ $isRtl ? 'rtl' : 'ltr' }}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>GSLC — @yield('page_title', $t('Dashboard'))</title>
    
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
    
    @vite(['resources/css/app.css', 'resources/js/app.tsx'])
    @stack('styles')
    
    <style>
        body { 
            font-family: 'DM Sans', sans-serif; 
            background-color: #F0F4F8; 
        }
        
        html[dir="rtl"] body, 
        html[dir="rtl"] body *:not(i):not(.fas):not(.far):not(.fab):not(.fa-solid) { 
            font-family: 'Cairo', sans-serif !important; 
        }

        .gslc-scroll::-webkit-scrollbar { width: 6px; height: 6px; }
        .gslc-scroll::-webkit-scrollbar-track { background: transparent; }
        .gslc-scroll::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 10px; }
        .gslc-scroll:hover::-webkit-scrollbar-thumb { background: #94A3B8; }
        
        [x-cloak] { display: none !important; }
        .flash-enter { animation: slideDown 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes slideDown { 
            from { opacity: 0; transform: translateY(-20px); } 
            to { opacity: 1; transform: translateY(0); } 
        }
    </style>
</head>
<body class="text-[#0D1F3C] antialiased min-h-screen flex flex-col overflow-x-hidden">

<div id="mobile-overlay" class="fixed inset-0 bg-[#0D1F3C]/60 z-40 hidden lg:hidden backdrop-blur-sm transition-opacity" onclick="toggleSidebar()"></div>

{{-- SIDEBAR: Absolute left/right mapping to prevent logical property failures --}}
<aside id="app-sidebar"
    class="fixed inset-y-0 z-50 w-64 bg-white flex flex-col transition-transform duration-300 shadow-[4px_0_24px_rgba(13,31,60,0.02)]
    {{ $isRtl ? 'right-0 border-l border-[#E2E8F0] translate-x-full lg:translate-x-0' : 'left-0 border-r border-[#E2E8F0] -translate-x-full lg:translate-x-0' }}">

    <div class="h-24 flex items-center justify-center gap-3 px-6 pt-4 border-b border-[#F0F4F8]">
        <img src="{{ asset('images/nashco_logo Company.jpg') }}" alt="NASHCO" class="h-10 w-auto rounded-md shadow-sm">
        <span class="text-[#0D1F3C] font-black text-2xl tracking-tight">GSLC</span>
    </div>

    <div class="px-5 mt-6 mb-4">
        <div class="flex items-center bg-[#F0F4F8] p-1.5 rounded-xl border border-[#E2E8F0]/50">
            @foreach(['fr' => 'FR', 'en' => 'EN', 'ar' => 'AR'] as $code => $label)
            <form method="POST" action="{{ route('blade.lang') }}" class="flex-1 m-0">
                @csrf
                <input type="hidden" name="lang" value="{{ $code }}">
                <button type="submit"
                    class="w-full text-xs font-extrabold py-2 rounded-lg transition-all duration-200
                           {{ $lang === $code
                              ? 'bg-white text-[#1A4A8C] shadow-sm border border-[#E2E8F0]'
                              : 'text-[#64748B] hover:text-[#0D1F3C]' }}">
                    {{ $label }}
                </button>
            </form>
            @endforeach
        </div>
    </div>

    <nav class="flex-1 overflow-y-auto gslc-scroll px-4 pb-6 flex flex-col gap-1.5 mt-2">
        @if(auth()->check())
            @php 
                $role = auth()->user()->role->label ?? 'commercial'; 
                $navItems = [];

                if($role === 'commercial') {
                    $navItems = [
                        ['url' => '/blade/commercial/dashboard', 'icon' => 'fa-border-all',      'label' => $t('Dashboard'), 'match' => 'blade/commercial/dashboard'],
                        ['url' => '/blade/commercial/clients',   'icon' => 'fa-user-group',      'label' => $t('Clients'),   'match' => 'blade/commercial/clients*'],
                        ['url' => '/blade/commercial/demands',   'icon' => 'fa-inbox',           'label' => $t('Demandes'),  'match' => 'blade/commercial/demands*'],
                        ['url' => '/blade/commercial/quotes',    'icon' => 'fa-file-invoice',    'label' => $t('Devis'),     'match' => 'blade/commercial/quotes*'],
                        ['url' => '/blade/commercial/contracts', 'icon' => 'fa-file-signature',  'label' => $t('Contrats'),  'match' => 'blade/commercial/contracts*'],
                    ];
                } 
                elseif($role === 'client') {
                    $navItems = [
                        ['url' => '/client/dashboard',   'icon' => 'fa-border-all', 'label' => $t('Dashboard'),    'match' => 'client/dashboard'],
                        ['url' => '/client/demands',     'icon' => 'fa-inbox',      'label' => $t('Mes Demandes'), 'match' => 'client/demands*'],
                    ];
                }
            @endphp

            @foreach($navItems as $item)
                @php $isActive = Request::is($item['match']); @endphp
                <a href="{{ $item['url'] }}"
                   class="group flex items-center gap-4 px-4 py-3.5 rounded-xl text-[15px] transition-all duration-200
                          {{ $isActive
                             ? 'bg-[#1A4A8C] text-white shadow-md font-bold'
                             : 'text-[#64748B] hover:bg-[#F0F4F8] hover:text-[#1A4A8C] font-medium' }}">
                    <i class="fas {{ $item['icon'] }} text-lg w-6 text-center transition-transform group-hover:scale-110 {{ $isActive ? 'text-white' : 'text-[#64748B] group-hover:text-[#1A4A8C]' }}"></i>
                    <span class="whitespace-nowrap">{{ $item['label'] }}</span>
                </a>
            @endforeach
        @endif
    </nav>

    @if(auth()->check())
    <div class="p-4 mt-auto border-t border-[#F0F4F8]">
        <form method="POST" action="{{ route('blade.logout') }}">
            @csrf
            <button type="submit"
                    class="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl text-sm font-bold
                           text-[#64748B] hover:bg-red-50 hover:text-[#EF4444] transition-all">
                <i class="fas fa-sign-out-alt text-lg"></i>
                <span class="whitespace-nowrap">{{ $t('Déconnexion') }}</span>
            </button>
        </form>
    </div>
    @endif
</aside>

{{-- MAIN CANVAS: Absolute margin mapping --}}
<div class="flex-1 flex flex-col transition-all duration-300 min-w-0 {{ $isRtl ? 'lg:mr-64' : 'lg:ml-64' }}">
    
    <header class="h-[100px] flex items-center justify-between px-4 sm:px-8 sticky top-0 z-30 bg-[#F0F4F8]/80 backdrop-blur-md">
        
        <div class="flex items-center gap-4">
            <button onclick="toggleSidebar()" class="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-white text-[#0D1F3C] shadow-sm border border-[#E2E8F0]">
                <i class="fas fa-bars text-lg"></i>
            </button>
            <div>
                <p class="text-xs sm:text-sm font-semibold text-[#64748B] mb-1">
                    {{ $t('Pages') }} / @yield('page_title', $t('Dashboard'))
                </p>
                <h1 class="text-[#0D1F3C] font-black text-2xl sm:text-[32px] leading-none tracking-tight">
                    @yield('page_title', $t('Dashboard'))
                </h1>
            </div>
        </div>

        <div class="flex items-center gap-3 sm:gap-5 bg-white rounded-full py-2 px-3 sm:px-4 shadow-sm border border-[#E2E8F0]">
            
            <div class="hidden xl:flex items-center bg-[#F0F4F8] rounded-full px-4 py-2 w-64 border border-transparent focus-within:border-[#1A4A8C]/30 focus-within:bg-white transition-all">
                <i class="fas fa-search text-[#64748B] text-sm"></i>
                <input type="text" placeholder="{{ $t('Rechercher...') }}" class="bg-transparent border-none outline-none text-sm font-medium text-[#0D1F3C] {{ $isRtl ? 'mr-3' : 'ml-3' }} w-full placeholder:text-[#94A3B8]">
            </div>

            <button class="relative w-10 h-10 flex items-center justify-center text-[#64748B] hover:text-[#1A4A8C] transition-colors rounded-full hover:bg-[#F0F4F8]">
                <i class="far fa-bell text-xl"></i>
                <span class="absolute top-2.5 right-2.5 w-2 h-2 bg-[#CFA030] rounded-full border-2 border-white"></span>
            </button>

            @if(auth()->check())
            <div class="flex items-center gap-3 cursor-pointer group border-[#E2E8F0] {{ $isRtl ? 'border-r pr-4 mr-1' : 'border-l pl-4 ml-1' }}">
                <div class="hidden md:block {{ $isRtl ? 'text-start' : 'text-end' }}">
                    <p class="text-sm font-bold text-[#0D1F3C] leading-tight">{{ auth()->user()->prenom }}</p>
                    <p class="text-[10px] font-bold text-[#64748B] uppercase tracking-wide">{{ auth()->user()->role->label ?? '' }}</p>
                </div>
                <div class="w-10 h-10 rounded-full bg-[#1A4A8C] flex items-center justify-center text-white text-sm font-bold shadow-sm group-hover:bg-[#0D1F3C] transition-colors">
                    {{ strtoupper(substr(auth()->user()->prenom, 0, 1)) }}{{ strtoupper(substr(auth()->user()->nom, 0, 1)) }}
                </div>
            </div>
            @endif
        </div>
    </header>

    <main class="flex-1 px-4 sm:px-8 pb-10 pt-2">
        
        @if(session('success'))
        <div class="flash-enter bg-white border-[#10B981] {{ $isRtl ? 'border-r-4' : 'border-l-4' }} rounded-xl p-4 mb-8 shadow-sm flex justify-between items-center" id="flash-success">
            <div class="flex items-center gap-4">
                <div class="w-8 h-8 rounded-full bg-[#10B981]/10 flex items-center justify-center flex-shrink-0">
                    <i class="fas fa-check text-[#10B981] text-sm"></i>
                </div>
                <div>
                    <h4 class="text-[#0D1F3C] font-bold text-sm">{{ $t('Succès') }}</h4>
                    <p class="text-[#64748B] text-sm font-medium">{{ session('success') }}</p>
                </div>
            </div>
            <button onclick="document.getElementById('flash-success').remove()" class="text-[#94A3B8] hover:text-[#0D1F3C] p-2">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <script>setTimeout(() => { const el = document.getElementById('flash-success'); if(el) el.style.opacity = '0'; setTimeout(()=> {if(el) el.remove()}, 300); }, 5000);</script>
        @endif

        @yield('content')

    </main>
</div>

@stack('scripts')

<script>
    function toggleSidebar() {
        const sidebar = document.getElementById('app-sidebar');
        const overlay = document.getElementById('mobile-overlay');
        const isRtl = document.documentElement.dir === 'rtl';

        const hiddenClass = isRtl ? 'translate-x-full' : '-translate-x-full';

        if (sidebar.classList.contains(hiddenClass)) {
            sidebar.classList.remove(hiddenClass);
            sidebar.classList.add('translate-x-0');
            overlay.classList.remove('hidden');
        } else {
            sidebar.classList.remove('translate-x-0');
            sidebar.classList.add(hiddenClass);
            overlay.classList.add('hidden');
        }
    }
</script>
</body>
</html>