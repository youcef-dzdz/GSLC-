<!DOCTYPE html>
<html lang="fr" id="html-root" dir="ltr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GSLC — Récupération d'accès Personnel</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet">
    @vite(['resources/css/app.css', 'resources/js/app.tsx'])
    <style>
        :root { --dark-bg:#0B1120; --dark-card:#111827; --dark-border:#1F2937; --navy:#0D1F3C; --gold:#CFA030; }
        * { font-family:'DM Sans',sans-serif; box-sizing:border-box; margin:0; padding:0; }
        h1,h2,.syne { font-family:'Syne',sans-serif; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        .fade-up  { animation:fadeUp .45s ease-out both; }
        .fade-up-2{ animation:fadeUp .45s ease-out .1s both; }
        .port-panel { background:linear-gradient(160deg,#0D1F3C 0%,#0a1628 60%,#081220 100%); }
        .port-overlay { background-image:url('{{ asset("images/hero2.jpg") }}'); background-size:cover; background-position:center; }
        .gold-line { width:40px; height:3px; background:linear-gradient(90deg,#CFA030,#e8b840); border-radius:2px; margin-bottom:1.5rem; }
        .input-field { width:100%; border:1.5px solid var(--dark-border); border-radius:10px; padding:12px 12px 12px 42px; font-size:.875rem; background:rgba(17,24,39,0.8); color:#fff; transition:border-color .2s,box-shadow .2s; outline:none; }
        .input-field:focus { border-color:var(--gold); box-shadow:0 0 0 3px rgba(207,160,48,0.1); }
        .input-field.error { border-color:#EF4444; }
        .input-icon { position:absolute; top:50%; transform:translateY(-50%); left:14px; color:#6B7280; font-size:.85rem; pointer-events:none; }
        .btn-primary { width:100%; background:linear-gradient(135deg,var(--gold) 0%,#B48520 100%); color:#fff; font-family:'Syne',sans-serif; font-weight:700; font-size:.95rem; padding:13px 24px; border-radius:10px; border:none; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px; transition:opacity .2s,transform .15s; }
        .btn-primary:hover { opacity:.92; transform:translateY(-1px); }
    </style>
</head>
<body style="min-height:100vh; background:var(--dark-bg); display:flex; align-items:stretch;">
<div style="display:flex; width:100%; min-height:100vh;">

    {{-- LEFT PANEL --}}
    <div class="port-panel hidden lg:flex" style="width:45%; flex-direction:column; position:relative; overflow:hidden; padding:3rem;">
        <div class="port-overlay" style="position:absolute; inset:0; opacity:0.12;"></div>
        <div style="position:absolute; top:-80px; right:-80px; width:320px; height:320px; border-radius:50%; background:rgba(207,160,48,0.06); pointer-events:none;"></div>
        <div style="position:absolute; bottom:-60px; left:-60px; width:240px; height:240px; border-radius:50%; background:rgba(26,74,140,0.15); pointer-events:none;"></div>

        <a href="/" style="position:relative; z-index:10; display:inline-flex; align-items:center; gap:8px; color:rgba(255,255,255,0.6); font-size:.8rem; font-weight:500; text-decoration:none; transition:color .2s; margin-bottom:auto;"
            onmouseover="this.style.color='#CFA030'" onmouseout="this.style.color='rgba(255,255,255,0.6)'">
            <i class="fas fa-arrow-left" style="font-size:.75rem;"></i> Retour à l'accueil
        </a>

        <div style="position:relative; z-index:10; flex:1; display:flex; flex-direction:column; justify-content:center;">
            <img src="{{ asset('images/nashco_logo Company.jpg') }}" alt="NASHCO"
                style="height:52px; width:auto; object-fit:contain; background:white; border-radius:10px; padding:6px 10px; margin-bottom:1.5rem;">
            <div class="gold-line"></div>
            <h2 class="syne" style="color:#CFA030; font-size:2.2rem; font-weight:800; margin:0 0 4px;">GSLC</h2>
            <p style="color:rgba(255,255,255,0.85); font-size:1.05rem; margin:0 0 4px; font-weight:300;">Espace Personnel</p>
            <p style="color:rgba(255,255,255,0.45); font-size:.8rem; margin:0; letter-spacing:.05em;">
                <i class="fas fa-anchor" style="margin-right:6px;"></i>NASHCO SPA
            </p>
        </div>

        <p style="position:relative; z-index:10; color:rgba(255,255,255,0.2); font-size:.7rem; margin-top:auto; text-align:center;">
            © {{ date('Y') }} EPE NASHCO Spa — Groupe GATMA
        </p>
    </div>

    {{-- RIGHT PANEL (dark) --}}
    <div style="flex:1; display:flex; flex-direction:column; justify-content:center; align-items:center; padding:2rem; background:var(--dark-bg); position:relative;">

        <a href="{{ route('staff.login') }}" style="position:absolute; top:1.25rem; left:1.25rem; display:flex; align-items:center; gap:6px; color:#6B7280; font-size:.8rem; font-weight:500; text-decoration:none; transition:color .2s;"
            onmouseover="this.style.color='#9CA3AF'" onmouseout="this.style.color='#6B7280'">
            <i class="fas fa-arrow-left"></i> Retour connexion
        </a>

        <div class="fade-up" style="width:100%; max-width:400px;">

            <div style="display:inline-flex; align-items:center; gap:6px; background:rgba(207,160,48,0.1); border:1px solid rgba(207,160,48,0.3); border-radius:20px; padding:4px 12px; margin-bottom:1.5rem;">
                <i class="fas fa-lock" style="color:var(--gold); font-size:.7rem;"></i>
                <span style="color:var(--gold); font-size:.7rem; font-weight:700; letter-spacing:.05em; text-transform:uppercase;">STAFF UNIQUEMENT</span>
            </div>

            <div style="width:48px; height:48px; background:rgba(207,160,48,0.1); border:1px solid rgba(207,160,48,0.3); border-radius:14px; display:flex; align-items:center; justify-content:center; margin-bottom:1.5rem;">
                <i class="fas fa-key" style="color:var(--gold); font-size:1.1rem;"></i>
            </div>

            <h1 class="syne" style="font-size:1.8rem; font-weight:800; color:#fff; margin:0 0 8px;">Mot de passe oublié ?</h1>
            <p style="color:#9CA3AF; font-size:.875rem; margin:0 0 2rem; line-height:1.6;">
                Entrez votre adresse email professionnelle et nous vous enverrons un lien de réinitialisation.
            </p>

            @if(session('success'))
            <div class="fade-up-2" style="background:rgba(16,185,129,0.1); border:1px solid rgba(16,185,129,0.3); border-radius:10px; padding:14px 16px; margin-bottom:1.5rem; display:flex; align-items:flex-start; gap:10px;">
                <i class="fas fa-check-circle" style="color:#10B981; margin-top:2px; flex-shrink:0;"></i>
                <span style="color:#6EE7B7; font-size:.85rem; line-height:1.5;">{{ session('success') }}</span>
            </div>
            @endif

            @if(session('error'))
            <div class="fade-up-2" style="background:rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.4); border-radius:10px; padding:14px 16px; margin-bottom:1.5rem; display:flex; align-items:flex-start; gap:10px;">
                <i class="fas fa-exclamation-circle" style="color:#EF4444; margin-top:2px; flex-shrink:0;"></i>
                <span style="color:#FCA5A5; font-size:.85rem;">{{ session('error') }}</span>
            </div>
            @endif

            <form method="POST" action="{{ route('staff.password.email') }}" class="fade-up-2">
                @csrf
                <div style="margin-bottom:1.5rem;">
                    <label style="display:block; font-size:.75rem; font-weight:600; color:#D1D5DB; margin-bottom:6px;">
                        Adresse email professionnelle
                    </label>
                    <div style="position:relative;">
                        <i class="fas fa-envelope input-icon"></i>
                        <input type="email" name="email" value="{{ old('email') }}" required autofocus
                            class="input-field {{ $errors->has('email') ? 'error' : '' }}"
                            placeholder="prenom.nom@nashco.dz">
                    </div>
                    @error('email')
                        <p style="color:#EF4444; font-size:.75rem; margin:4px 0 0;">{{ $message }}</p>
                    @enderror
                </div>

                <button type="submit" class="btn-primary">
                    <i class="fas fa-paper-plane" style="font-size:.8rem;"></i>
                    <span>Envoyer le lien de réinitialisation</span>
                </button>
            </form>

            <p style="text-align:center; font-size:.85rem; color:#6B7280; margin-top:1.5rem;">
                <a href="{{ route('staff.login') }}" style="color:var(--gold); font-weight:600; text-decoration:none;">
                    <i class="fas fa-arrow-left" style="font-size:.75rem; margin-right:4px;"></i>Retour à la connexion
                </a>
            </p>
        </div>
    </div>
</div>
</body>
</html>
