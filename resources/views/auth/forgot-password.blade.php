<!DOCTYPE html>
<html lang="fr" id="html-root" dir="ltr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GSLC — Mot de passe oublié</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@700;800;900&display=swap" rel="stylesheet">
    @vite(['resources/css/app.css', 'resources/js/app.tsx'])
    <style>
        :root { --navy:#0D1F3C; --blue:#1A4A8C; --gold:#CFA030; --bg-soft:#f7f9fc; --text-main:#1e293b; --text-muted:#64748B; }
        * { font-family:'Inter',sans-serif; box-sizing:border-box; margin:0; padding:0; }
        h1,h2,.syne { font-family:'Plus Jakarta Sans',sans-serif; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        .fade-up  { animation:fadeUp .45s ease-out both; }
        .fade-up-2{ animation:fadeUp .45s ease-out .1s both; }
        .port-panel { background:linear-gradient(160deg,#0D1F3C 0%,#0a1628 60%,#081220 100%); }
        .port-overlay { background-image:url('{{ asset("images/hero2.jpg") }}'); background-size:cover; background-position:center; }
        .gold-line { width:40px; height:3px; background:linear-gradient(90deg,#CFA030,#e8b840); border-radius:2px; margin-bottom:1.5rem; }
        .input-field { width:100%; border:1.5px solid #e2e8f0; border-radius:10px; padding:12px 12px 12px 42px; font-size:.875rem; background:#f8fafc; color:var(--text-main); transition:border-color .2s,box-shadow .2s,background .2s; outline:none; }
        .input-field:focus { border-color:#0D1F3C; box-shadow:0 0 0 3px rgba(13,31,60,.1); background:#fff; }
        .input-field.error { border-color:#EF4444; background:#fff5f5; }
        .input-icon { position:absolute; top:50%; transform:translateY(-50%); left:14px; color:#94a3b8; font-size:.85rem; pointer-events:none; }
        .btn-primary { width:100%; background:var(--navy); color:#fff; font-weight:700; font-size:.9rem; padding:13px 24px; border-radius:10px; border:none; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px; box-shadow:0 4px 12px rgba(13,31,60,.25); transition:all .2s; }
        .btn-primary:hover { background:var(--blue); transform:translateY(-2px); box-shadow:0 6px 16px rgba(13,31,60,.3); }
    </style>
</head>
<body style="min-height:100vh; background:var(--bg-soft); display:flex; align-items:stretch;">
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
            <h2 class="syne" style="color:#CFA030; font-size:2.2rem; font-weight:800; margin:0 0 4px; letter-spacing:-0.5px;">GSLC</h2>
            <p style="color:rgba(255,255,255,0.85); font-size:1.05rem; margin:0 0 4px;">Récupération d'accès</p>
            <p style="color:rgba(255,255,255,0.45); font-size:.8rem; margin:0; letter-spacing:.05em;">
                <i class="fas fa-anchor" style="margin-right:6px;"></i>Port de Mostaganem — Algérie
            </p>
        </div>

        <p style="position:relative; z-index:10; color:rgba(255,255,255,0.2); font-size:.7rem; margin-top:auto; text-align:center;">
            © {{ date('Y') }} EPE NASHCO Spa — Groupe GATMA
        </p>
    </div>

    {{-- RIGHT PANEL --}}
    <div style="flex:1; display:flex; flex-direction:column; justify-content:center; align-items:center; padding:2rem; background:var(--bg-soft); position:relative;">

        <a href="/" class="lg:hidden" style="position:absolute; top:1.25rem; left:1.25rem; display:flex; align-items:center; gap:6px; color:#6B7280; font-size:.8rem; font-weight:500; text-decoration:none;">
            <i class="fas fa-arrow-left"></i> Accueil
        </a>

        <div class="fade-up" style="width:100%; max-width:420px; background:#fff; padding:2.5rem; border-radius:16px; box-shadow:0 10px 40px rgba(0,0,0,.03); border:1px solid #e2e8f0;">

            {{-- Icon --}}
            <div style="width:52px; height:52px; background:rgba(13,31,60,.06); border-radius:14px; display:flex; align-items:center; justify-content:center; margin-bottom:1.5rem;">
                <i class="fas fa-key" style="color:var(--navy); font-size:1.2rem;"></i>
            </div>

            <h1 class="syne" style="font-size:1.8rem; font-weight:800; color:var(--navy); margin:0 0 8px;">Mot de passe oublié ?</h1>
            <p style="color:var(--text-muted); font-size:.875rem; margin:0 0 2rem; line-height:1.6;">
                Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
            </p>

            {{-- Success --}}
            @if(session('success'))
            <div class="fade-up-2" style="background:#ECFDF5; border:1px solid #A7F3D0; border-radius:10px; padding:14px 16px; margin-bottom:1.5rem; display:flex; align-items:flex-start; gap:10px;">
                <i class="fas fa-check-circle" style="color:#059669; margin-top:2px; flex-shrink:0;"></i>
                <span style="color:#065F46; font-size:.85rem; line-height:1.5;">{{ session('success') }}</span>
            </div>
            @endif

            {{-- Error --}}
            @if(session('error'))
            <div class="fade-up-2" style="background:#FEF2F2; border:1px solid #FECACA; border-radius:10px; padding:14px 16px; margin-bottom:1.5rem; display:flex; align-items:flex-start; gap:10px;">
                <i class="fas fa-exclamation-circle" style="color:#EF4444; margin-top:2px; flex-shrink:0;"></i>
                <span style="color:#B91C1C; font-size:.85rem;">{{ session('error') }}</span>
            </div>
            @endif

            <form method="POST" action="{{ route('client.password.email') }}" class="fade-up-2">
                @csrf
                <div style="margin-bottom:1.5rem;">
                    <label style="display:block; font-size:.82rem; font-weight:600; color:var(--text-main); margin-bottom:8px;">
                        Adresse email
                    </label>
                    <div style="position:relative;">
                        <i class="fas fa-envelope input-icon"></i>
                        <input type="email" name="email" value="{{ old('email') }}" required autofocus
                            class="input-field {{ $errors->has('email') ? 'error' : '' }}"
                            placeholder="votre@email.com">
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

            <p style="text-align:center; font-size:.85rem; color:var(--text-muted); margin-top:1.5rem;">
                <a href="{{ route('client.login') }}" style="color:var(--navy); font-weight:600; text-decoration:none;">
                    <i class="fas fa-arrow-left" style="font-size:.75rem; margin-right:4px;"></i>Retour à la connexion
                </a>
            </p>
        </div>
    </div>
</div>
</body>
</html>
