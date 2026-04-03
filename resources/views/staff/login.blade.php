<!DOCTYPE html>
<html lang="fr" id="html-root" dir="ltr">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GSLC — Espace Personnel NASHCO</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link
        href="https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500;600&family=Noto+Sans+Arabic:wght@300;400;500;600;700&display=swap"
        rel="stylesheet">
    @vite(['resources/css/app.css', 'resources/js/app.tsx'])
    <style>
        :root {
            --dark-bg: #0B1120;
            --dark-card: #111827;
            --dark-border: #1F2937;
            --navy: #0D1F3C;
            --blue: #1A4A8C;
            --gold: #CFA030;
        }

        * {
            font-family: 'DM Sans', sans-serif;
            box-sizing: border-box;
        }

        h1,
        h2,
        .syne {
            font-family: 'Syne', sans-serif;
        }

        /* Language Support - Fixed Icon Override */
        body.lang-ar,
        body.lang-ar *:not(i):not(.fas):not(.far):not(.fab):not(.fa-solid) {
            font-family: 'Noto Sans Arabic', sans-serif !important;
        }

        body.lang-ar .syne {
            font-family: 'Noto Sans Arabic', sans-serif !important;
            font-weight: 700;
        }

        @keyframes fadeUp {
            from {
                opacity: 0;
                transform: translateY(20px);
            }

            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .fade-up {
            animation: fadeUp 0.45s ease-out both;
        }

        .fade-up-2 {
            animation: fadeUp 0.45s ease-out 0.1s both;
        }

        .fade-up-3 {
            animation: fadeUp 0.45s ease-out 0.2s both;
        }

        .port-panel {
            background: linear-gradient(160deg, #0D1F3C 0%, #0a1628 60%, #081220 100%);
        }

        .port-overlay {
            background-image: url('{{ asset("images/hero2.jpg") }}');
            background-size: cover;
            background-position: center;
        }

        .gold-line {
            width: 40px;
            height: 3px;
            background: linear-gradient(90deg, #CFA030, #e8b840);
            border-radius: 2px;
            margin-bottom: 1.5rem;
        }

        .right-panel {
            background: var(--dark-bg);
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            padding: 2rem;
            position: relative;
            color: #fff;
        }

        .lang-sw {
            display: flex;
            align-items: center;
            gap: 3px;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid var(--dark-border);
            border-radius: 24px;
            padding: 4px;
            width: fit-content;
            margin-bottom: 2rem;
        }

        [dir="ltr"] .lang-sw {
            margin-left: auto;
        }

        [dir="rtl"] .lang-sw {
            margin-right: auto;
        }

        .lang-btn {
            padding: 5px 14px;
            border-radius: 20px;
            font-size: 0.72rem;
            font-weight: 700;
            border: none;
            cursor: pointer;
            transition: all 0.2s;
            background: transparent;
            color: #9CA3AF;
        }

        .lang-btn.active {
            background: #374151;
            color: #fff;
        }

        .lang-btn:not(.active):hover {
            background: rgba(255, 255, 255, 0.1);
            color: #E5E7EB;
        }

        .input-field {
            width: 100%;
            border: 1.5px solid var(--dark-border);
            border-radius: 10px;
            padding: 11px 40px;
            font-size: 0.875rem;
            background: rgba(17, 24, 39, 0.8);
            color: #fff;
            transition: border-color 0.2s, box-shadow 0.2s;
            outline: none;
        }

        .input-field:focus {
            border-color: var(--gold);
            box-shadow: 0 0 0 3px rgba(207, 160, 48, 0.1);
        }

        .input-field.error {
            border-color: #EF4444;
        }

        .input-icon {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            color: #6B7280;
            font-size: 0.8rem;
            pointer-events: none;
        }

        [dir="ltr"] .input-icon {
            left: 14px;
        }

        [dir="rtl"] .input-icon {
            right: 14px;
        }

        .eye-btn {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            background: none;
            border: none;
            cursor: pointer;
            color: #6B7280;
            font-size: 0.85rem;
            padding: 4px;
            transition: color 0.2s;
        }

        [dir="ltr"] .eye-btn {
            right: 12px;
        }

        [dir="rtl"] .eye-btn {
            left: 12px;
        }

        .eye-btn:hover {
            color: #D1D5DB;
        }

        .btn-primary {
            width: 100%;
            background: linear-gradient(135deg, var(--gold) 0%, #B48520 100%);
            color: #fff;
            font-family: 'Syne', sans-serif;
            font-weight: 700;
            font-size: 0.95rem;
            padding: 13px 24px;
            border-radius: 10px;
            border: none;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            transition: opacity 0.2s, transform 0.15s;
        }

        .btn-primary:hover {
            opacity: 0.92;
            transform: translateY(-1px);
        }

        /* Modal styling */
        .modal-ov {
            position: fixed;
            inset: 0;
            z-index: 200;
            background: rgba(0, 0, 0, 0.6);
            backdrop-filter: blur(5px);
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.25s;
        }

        .modal-ov.open {
            opacity: 1;
            pointer-events: all;
        }

        .modal-box {
            background: var(--dark-card);
            border: 1px solid var(--dark-border);
            border-radius: 16px;
            padding: 2rem;
            width: 100%;
            max-width: 400px;
            margin: 1rem;
            color: #fff;
            transform: translateY(24px) scale(0.97);
            transition: transform 0.28s;
        }

        .modal-ov.open .modal-box {
            transform: translateY(0) scale(1);
        }

        .modal-close {
            position: absolute;
            top: 1rem;
            background: none;
            border: none;
            cursor: pointer;
            color: #9CA3AF;
            font-size: 1rem;
            padding: 4px;
            transition: color 0.2s;
        }

        [dir="ltr"] .modal-close {
            right: 1rem;
        }

        [dir="rtl"] .modal-close {
            left: 1rem;
        }

        .modal-close:hover {
            color: #fff;
        }
    </style>
</head>

<body style="min-height:100vh; background:var(--dark-bg); display:flex; align-items:stretch;">

    <div class="modal-ov" id="forgotModal">
        <div class="modal-box">
            <button class="modal-close" onclick="closeForgot()"><i class="fas fa-times"></i></button>
            <div
                style="width:44px;height:44px;border-radius:12px;background:rgba(207,160,48,0.12);display:flex;align-items:center;justify-content:center;margin-bottom:1rem;">
                <i class="fas fa-key" style="color:var(--gold);font-size:1.1rem;"></i>
            </div>
            <h3 class="syne" id="m-title" style="font-size:1.15rem;font-weight:800;color:#fff;margin-bottom:6px;"></h3>
            <p id="m-desc" style="color:#9CA3AF;font-size:0.82rem;margin-bottom:1.4rem;line-height:1.5;"></p>

            <div style="margin-bottom:1.5rem;">
                <label id="m-label"
                    style="display:block;font-size:0.75rem;font-weight:600;color:#D1D5DB;margin-bottom:6px;"></label>
                <div style="position:relative;">
                    <i class="fas fa-envelope input-icon"></i>
                    <input type="email" id="m-email" class="input-field" required>
                </div>
            </div>

            <button onclick="submitForgot()" id="m-btn" class="btn-primary" style="margin-bottom:1rem;"></button>
            <p id="m-note" style="text-align:center;font-size:0.7rem;color:#6B7280;margin:0;"></p>
        </div>
    </div>

    <div style="display:flex; width:100%; min-height:100vh;">

        {{-- ═══ LEFT PANEL ═══ --}}
        <div class="port-panel hidden lg:flex"
            style="width:45%; flex-direction:column; position:relative; overflow:hidden; padding:3rem;">
            <div class="port-overlay" style="position:absolute; inset:0; opacity:0.12;"></div>

            <div
                style="position:absolute; top:-80px; right:-80px; width:320px; height:320px; border-radius:50%; background:rgba(207,160,48,0.06); pointer-events:none;">
            </div>
            <div
                style="position:absolute; bottom:-60px; left:-60px; width:240px; height:240px; border-radius:50%; background:rgba(26,74,140,0.15); pointer-events:none;">
            </div>

            <a href="/"
                style="position:relative; z-index:10; display:inline-flex; align-items:center; gap:8px; color:rgba(255,255,255,0.6); font-size:0.8rem; font-weight:500; text-decoration:none; transition:color 0.2s; margin-bottom:auto;"
                onmouseover="this.style.color='#CFA030'" onmouseout="this.style.color='rgba(255,255,255,0.6)'">
                <i class="fas fa-arrow-left" id="back-ico" style="font-size:0.75rem;"></i> <span id="back-txt">Retour à
                    l'accueil</span>
            </a>

            <div
                style="position:relative; z-index:10; flex:1; display:flex; flex-direction:column; justify-content:center;">
                <div style="margin-bottom:2rem;">
                    <img src="{{ asset('images/nashco_logo Company.jpg') }}" alt="NASHCO"
                        style="height:52px; width:auto; object-fit:contain; background:white; border-radius:10px; padding:6px 10px; margin-bottom:1.5rem;">
                    <div class="gold-line"></div>
                    <h2 class="syne" style="color:#CFA030; font-size:2.2rem; font-weight:800; margin:0 0 4px;">GSLC</h2>
                    <p id="hero-title"
                        style="color:rgba(255,255,255,0.85); font-size:1.05rem; margin:0 0 4px; font-weight:300;">Espace
                        Personnel</p>
                    <p style="color:rgba(255,255,255,0.45); font-size:0.8rem; margin:0; letter-spacing:0.05em;">
                        <i class="fas fa-anchor" style="margin-right:6px;"></i> NASHCO SPA
                    </p>
                </div>
                <div style="display:flex; flex-direction:column; gap:12px; max-width:340px;">
                    <div
                        style="display:flex; align-items:center; gap:12px; padding:12px 16px; background:rgba(255,255,255,0.05); border:1px solid rgba(207,160,48,0.2); border-radius:12px; backdrop-filter:blur(4px);">
                        <div
                            style="width:36px; height:36px; border-radius:10px; background:rgba(207,160,48,0.15); display:flex; align-items:center; justify-content:center; flex-shrink:0;">
                            <i class="fas fa-shield-alt" style="color:#CFA030; font-size:0.85rem;"></i>
                        </div>
                        <span id="f1-txt" style="color:rgba(255,255,255,0.8); font-size:0.85rem;">Accès Sécurisé
                            Intranet</span>
                    </div>
                </div>
            </div>
            <div
                style="position:relative; z-index:10; color:rgba(255,255,255,0.2); font-size:0.7rem; text-align:center; margin-top:auto;">
                &copy; {{ date('Y') }} NASHCO SPA. Tous droits réservés.
            </div>
        </div>

        {{-- ═══ RIGHT PANEL (Dark Theme Form) ═══ --}}
        <div class="right-panel">

            <div style="width:100%; max-width:400px;" class="fade-up">
                <div class="lang-sw">
                    <button class="lang-btn" id="btn-ar" onclick="setLang('ar')">العربية</button>
                    <button class="lang-btn active" id="btn-fr" onclick="setLang('fr')">FR</button>
                    <button class="lang-btn" id="btn-en" onclick="setLang('en')">EN</button>
                </div>

                <div style="margin-bottom:2.5rem;">
                    <div
                        style="display:inline-flex; align-items:center; gap:6px; background:rgba(207,160,48,0.1); border:1px solid rgba(207,160,48,0.3); border-radius:20px; padding:4px 12px; margin-bottom:1rem;">
                        <i class="fas fa-lock" style="color:var(--gold); font-size:0.7rem;"></i>
                        <span id="badge-txt"
                            style="color:var(--gold); font-size:0.7rem; font-weight:700; letter-spacing:0.05em; text-transform:uppercase;">STAFF
                            UNIQUEMENT</span>
                    </div>
                    <h1 class="syne" id="auth-title"
                        style="color:#fff; font-size:1.8rem; font-weight:800; margin:0 0 6px;">Connexion Agent</h1>
                    <p id="auth-desc" style="color:#9CA3AF; font-size:0.85rem; margin:0;">Veuillez utiliser vos
                        identifiants internes.</p>
                </div>

                @if(session('error'))
                    <div
                        style="border-radius:10px; padding:12px 16px; margin-bottom:1.5rem; display:flex; align-items:flex-start; gap:10px; font-size:0.85rem; background:rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.4); color:#FCA5A5;">
                        <i class="fas fa-exclamation-circle" style="flex-shrink:0; margin-top:2px;"></i>
                        <span>{{ session('error') }}</span>
                    </div>
                @endif

                <form method="POST" action="{{ route('staff.login.post') }}" class="fade-up-2">
                    @csrf
                    <div style="margin-bottom:1.25rem;">
                        <label id="lbl-email"
                            style="display:block; font-size:0.75rem; font-weight:600; color:#D1D5DB; margin-bottom:6px;">Adresse
                            Email Professionnelle</label>
                        <div style="position:relative;">
                            <i class="fas fa-envelope input-icon"></i>
                            <input type="email" name="email" value="{{ old('email') }}" required
                                class="input-field {{ $errors->has('email') ? 'error' : '' }}"
                                placeholder="prenom.nom@nashco.dz" id="email-inp">
                        </div>
                        @error('email')<p style="color:#EF4444; font-size:0.75rem; margin:4px 0 0;">{{ $message }}</p>
                        @enderror
                    </div>

                    <div style="margin-bottom:0.75rem;">
                        <label id="lbl-pwd"
                            style="display:block; font-size:0.75rem; font-weight:600; color:#D1D5DB; margin-bottom:6px;">Mot
                            de passe</label>
                        <div style="position:relative;">
                            <i class="fas fa-lock input-icon"></i>
                            <input type="password" name="password" required id="pass-inp"
                                class="input-field {{ $errors->has('password') ? 'error' : '' }}"
                                placeholder="••••••••">
                            <button type="button" class="eye-btn" onclick="togglePwd()"><i id="eye-ico"
                                    class="fas fa-eye"></i></button>
                        </div>
                        @error('password')<p style="color:#EF4444; font-size:0.75rem; margin:4px 0 0;">{{ $message }}
                        </p>@enderror
                    </div>

                    <div style="text-align:right; margin-bottom:1.5rem;">
                        <a href="#" onclick="openForgot()" id="lbl-forgot"
                            style="font-size:0.78rem; color:var(--gold); text-decoration:none; font-weight:500; transition:opacity 0.2s;">Mot
                            de passe oublié ?</a>
                    </div>

                    <button type="submit" class="btn-primary" id="btn-login">
                        <i class="fas fa-sign-in-alt"></i> <span id="btn-login-txt">Se connecter</span>
                    </button>
                </form>
            </div>

        </div>
    </div>

    <script>
        const TR = {
            fr: {
                back: "Retour à l'accueil", hero: "Espace Personnel", f1: "Accès Sécurisé Intranet",
                badge: "STAFF UNIQUEMENT", title: "Connexion Agent", desc: "Veuillez utiliser vos identifiants internes.",
                email: "Adresse Email Professionnelle", ep: "prenom.nom@nashco.dz", pwd: "Mot de passe",
                forgot: "Mot de passe oublié ?", login: "Se connecter",
                mt: "Récupération d'accès", md: "Veuillez contacter l'administrateur système pour réinitialiser vos accès internes.",
                ml: "Votre Email NASHCO", mp: "Entrez votre email", mb: "Envoyer la demande", mn: "L'assistance IT vous contactera sous peu.",
                sent: "Demande envoyée"
            },
            en: {
                back: "Back to Home", hero: "Staff Portal", f1: "Secure Intranet Access",
                badge: "STAFF ONLY", title: "Agent Login", desc: "Please use your internal credentials.",
                email: "Professional Email Address", ep: "first.last@nashco.dz", pwd: "Password",
                forgot: "Forgot Password?", login: "Sign In",
                mt: "Access Recovery", md: "Please contact the system administrator to reset your internal access.",
                ml: "Your NASHCO Email", mp: "Enter your email", mb: "Submit Request", mn: "IT support will contact you shortly.",
                sent: "Request Sent"
            },
            ar: {
                back: "العودة للرئيسية", hero: "بوابة الموظفين", f1: "وصول آمن للإنترانت",
                badge: "للموظفين فقط", title: "تسجيل دخول الوكيل", desc: "يرجى استخدام بيانات الاعتماد الداخلية الخاصة بك.",
                email: "البريد الإلكتروني المهني", ep: "اسم.لقب@nashco.dz", pwd: "كلمة المرور",
                forgot: "نسيت كلمة المرور؟", login: "تسجيل الدخول",
                mt: "استعادة الوصول", md: "يرجى الاتصال بمسؤول النظام لإعادة تعيين وصولك الداخلي.",
                ml: "بريد NASHCO الخاص بك", mp: "أدخل بريدك الإلكتروني", mb: "إرسال الطلب", mn: "سيتصل بك دعم تكنولوجيا المعلومات قريبًا.",
                sent: "تم إرسال الطلب"
            }
        };

        let curLang = 'fr';

        function setLang(l) {
            curLang = l;
            document.getElementById('btn-fr').className = (l === 'fr' ? 'lang-btn active' : 'lang-btn');
            document.getElementById('btn-en').className = (l === 'en' ? 'lang-btn active' : 'lang-btn');
            document.getElementById('btn-ar').className = (l === 'ar' ? 'lang-btn active' : 'lang-btn');

            const isAr = (l === 'ar');
            document.getElementById('html-root').dir = isAr ? 'rtl' : 'ltr';
            document.getElementById('html-root').lang = l;
            document.body.className = isAr ? 'lang-ar' : '';

            if (isAr) {
                document.getElementById('back-ico').className = 'fas fa-arrow-right';
            } else {
                document.getElementById('back-ico').className = 'fas fa-arrow-left';
            }

            const t = TR[l];
            document.getElementById('back-txt').innerText = t.back;
            document.getElementById('hero-title').innerText = t.hero;
            document.getElementById('f1-txt').innerText = t.f1;
            document.getElementById('badge-txt').innerText = t.badge;
            document.getElementById('auth-title').innerText = t.title;
            document.getElementById('auth-desc').innerText = t.desc;
            document.getElementById('lbl-email').innerText = t.email;
            document.getElementById('email-inp').placeholder = t.ep;
            document.getElementById('lbl-pwd').innerText = t.pwd;
            document.getElementById('lbl-forgot').innerText = t.forgot;
            document.getElementById('btn-login-txt').innerText = t.login;

            document.getElementById('m-title').innerText = t.mt;
            document.getElementById('m-desc').innerText = t.md;
            document.getElementById('m-label').innerText = t.ml;
            document.getElementById('m-email').placeholder = t.mp;
            document.getElementById('m-btn').innerText = t.mb;
            document.getElementById('m-note').innerText = t.mn;
        }

        function togglePwd() {
            const inp = document.getElementById('pass-inp');
            const ico = document.getElementById('eye-ico');
            if (inp.type === 'password') {
                inp.type = 'text'; ico.className = 'fas fa-eye-slash';
            } else {
                inp.type = 'password'; ico.className = 'fas fa-eye';
            }
        }

        function openForgot() {
            document.getElementById('forgotModal').classList.add('open');
            setTimeout(() => document.getElementById('m-email').focus(), 250);
        }
        function closeForgot() {
            document.getElementById('forgotModal').classList.remove('open');
        }
        function submitForgot() {
            const em = document.getElementById('m-email');
            if (!em.value) { em.style.borderColor = '#EF4444'; em.focus(); return; }
            const btn = document.getElementById('m-btn');
            btn.innerHTML = '<i class="fas fa-check" style="margin-right:6px;"></i> ' + TR[curLang].sent;
            btn.style.background = '#10B981'; btn.style.pointerEvents = 'none';
            setTimeout(() => { closeForgot(); btn.style.background = ''; btn.innerText = TR[curLang].mb; btn.style.pointerEvents = 'all'; em.value = ''; }, 2000);
        }
    </script>
</body>

</html>