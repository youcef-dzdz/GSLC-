<!DOCTYPE html>
<html lang="fr" id="html-root" dir="ltr">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GSLC — Espace Client Importateur</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@700;800;900&family=Noto+Sans+Arabic:wght@400;500;600;700&display=swap"
        rel="stylesheet">
    @vite(['resources/css/app.css', 'resources/js/app.tsx'])
    <style>
        :root {
            --navy: #0D1F3C;
            --blue: #1A4A8C;
            --gold: #CFA030;
            --bg-soft: #f7f9fc;
            --text-main: #1e293b;
            --text-muted: #64748B;
        }

        * {
            font-family: 'Inter', sans-serif;
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        h1,
        h2,
        .syne {
            font-family: 'Plus Jakarta Sans', sans-serif;
        }

        /* Language Support - Fixed Icon Override */
        body.lang-ar,
        body.lang-ar *:not(i):not(.fas):not(.far):not(.fab):not(.fa-solid) {
            font-family: 'Noto Sans Arabic', sans-serif !important;
        }

        body.lang-ar .syne {
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

        .feature-chip {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px 16px;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(207, 160, 48, 0.2);
            border-radius: 12px;
            backdrop-filter: blur(4px);
        }

        .chip-icon {
            width: 36px;
            height: 36px;
            border-radius: 10px;
            background: rgba(207, 160, 48, 0.15);
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
        }

        /* Language Switcher Styling */
        .lang-sw {
            display: flex;
            align-items: center;
            gap: 3px;
            background: #e2e8f0;
            border-radius: 24px;
            padding: 4px;
            width: fit-content;
            margin-bottom: 1.5rem;
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
            font-size: 0.75rem;
            font-weight: 700;
            border: none;
            cursor: pointer;
            transition: all 0.2s;
            background: transparent;
            color: var(--text-muted);
        }

        .lang-btn.active {
            background: var(--navy);
            color: #fff;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .lang-btn:not(.active):hover {
            color: var(--navy);
        }

        /* Input Formatting logic for LTR/RTL - Softer Colors */
        .input-field {
            width: 100%;
            border: 1.5px solid #e2e8f0;
            border-radius: 10px;
            font-size: 0.875rem;
            background: #f8fafc;
            color: var(--text-main);
            transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
            outline: none;
        }

        [dir="ltr"] .input-field {
            padding: 12px 12px 12px 42px;
        }

        [dir="rtl"] .input-field {
            padding: 12px 42px 12px 12px;
        }

        .input-field:focus {
            border-color: #0D1F3C;
            box-shadow: 0 0 0 3px rgba(13, 31, 60, 0.1);
            background: #ffffff;
        }

        .input-field.error {
            border-color: #EF4444;
            background: #fff5f5;
        }

        .input-icon {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            color: #94a3b8;
            font-size: 0.85rem;
            pointer-events: none;
        }

        [dir="ltr"] .input-icon {
            left: 14px;
        }

        [dir="rtl"] .input-icon {
            right: 14px;
        }

        /* Password Eye Toggle */
        .eye-btn {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            background: none;
            border: none;
            cursor: pointer;
            color: #94A3B8;
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
            color: #475569;
        }

        .btn-primary {
            width: 100%;
            background: var(--navy);
            color: white;
            font-weight: 700;
            font-size: 0.9rem;
            padding: 13px 24px;
            border-radius: 10px;
            border: none;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            box-shadow: 0 4px 12px rgba(13, 31, 60, .25);
            transition: all 0.2s;
        }

        .btn-primary:hover {
            background: var(--blue);
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(13, 31, 60, .3);
        }
    </style>
</head>

<body style="min-height:100vh; background:var(--bg-soft); display:flex; align-items:stretch;">

    <div style="display:flex; width:100%; min-height:100vh;">

        {{-- ═══ LEFT PANEL — Maritime Brand ═══ --}}
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
                <i class="fas fa-arrow-left" id="back-ico" style="font-size:0.75rem;"></i> <span id="t-back">Retour à
                    l'accueil</span>
            </a>

            <div
                style="position:relative; z-index:10; flex:1; display:flex; flex-direction:column; justify-content:center;">
                <div style="margin-bottom:2rem;">
                    <img src="{{ asset('images/nashco_logo Company.jpg') }}" alt="NASHCO"
                        style="height:52px; width:auto; object-fit:contain; background:white; border-radius:10px; padding:6px 10px; margin-bottom:1.5rem;">
                    <div class="gold-line"></div>
                    <h2 class="syne"
                        style="color:#CFA030; font-size:2.2rem; font-weight:800; margin:0 0 4px; letter-spacing:-0.5px;">
                        GSLC</h2>
                    <p id="t-portal"
                        style="color:rgba(255,255,255,0.85); font-size:1.05rem; margin:0 0 4px; font-weight:400;">
                        Portail Importateur</p>
                    <p id="t-port"
                        style="color:rgba(255,255,255,0.45); font-size:0.8rem; margin:0; letter-spacing:0.05em;">
                        <i class="fas fa-anchor" style="margin-right:6px;"></i>Port de Mostaganem — Algérie
                    </p>
                </div>

                <div style="display:flex; flex-direction:column; gap:10px;">
                    <div class="feature-chip">
                        <div class="chip-icon"><i class="fas fa-inbox" style="color:#CFA030; font-size:0.85rem;"></i>
                        </div>
                        <span id="t-f1" style="color:rgba(255,255,255,0.85); font-size:0.85rem;">Soumettez vos demandes
                            d'importation</span>
                    </div>
                    <div class="feature-chip">
                        <div class="chip-icon"><i class="fas fa-file-contract"
                                style="color:#CFA030; font-size:0.85rem;"></i></div>
                        <span id="t-f2" style="color:rgba(255,255,255,0.85); font-size:0.85rem;">Suivez vos contrats et
                            factures</span>
                    </div>
                    <div class="feature-chip">
                        <div class="chip-icon"><i class="fas fa-file-pdf" style="color:#CFA030; font-size:0.85rem;"></i>
                        </div>
                        <span id="t-f3" style="color:rgba(255,255,255,0.85); font-size:0.85rem;">Téléchargez vos
                            documents PDF</span>
                    </div>
                </div>
            </div>

            <p
                style="position:relative; z-index:10; color:rgba(255,255,255,0.2); font-size:0.7rem; margin-top:auto; text-align:center;">
                © {{ date('Y') }} EPE NASHCO Spa — Groupe GATMA
            </p>
        </div>

        {{-- ═══ RIGHT PANEL — Login Form ═══ --}}
        <div
            style="flex:1; display:flex; flex-direction:column; justify-content:center; align-items:center; padding:2rem; background:var(--bg-soft); position:relative;">

            <a href="/" class="lg:hidden"
                style="position:absolute; top:1.25rem; left:1.25rem; display:flex; align-items:center; gap:6px; color:#6B7280; font-size:0.8rem; font-weight:500; text-decoration:none;">
                <i class="fas fa-arrow-left" id="back-mob-ico"></i> <span id="t-backmob">Accueil</span>
            </a>

            <div class="fade-up"
                style="width:100%; max-width:420px; background:#ffffff; padding:2.5rem; border-radius:16px; box-shadow:0 10px 40px rgba(0,0,0,0.03); border:1px solid #e2e8f0;">

                {{-- Language Switcher --}}
                <div class="lang-sw">
                    <button type="button" class="lang-btn" id="btn-ar" onclick="setLang('ar')">العربية</button>
                    <button type="button" class="lang-btn active" id="btn-fr" onclick="setLang('fr')">FR</button>
                    <button type="button" class="lang-btn" id="btn-en" onclick="setLang('en')">EN</button>
                </div>

                <div class="lg:hidden" style="text-align:center; margin-bottom:2rem;">
                    <img src="{{ asset('images/nashco_logo Company.jpg') }}" alt="NASHCO"
                        style="height:44px; width:auto; object-fit:contain; margin:0 auto 8px; display:block; border-radius:6px;">
                    <span class="syne"
                        style="color:#0D1F3C; font-weight:800; font-size:1.2rem; letter-spacing:-0.5px;">GSLC</span>
                </div>

                <div class="fade-up" style="margin-bottom:2rem;">
                    <div
                        style="display:inline-flex; align-items:center; gap:8px; background:var(--bg-soft); border-radius:20px; padding:6px 14px; margin-bottom:1rem; border:1px solid #e2e8f0;">
                        <i class="fas fa-user-circle" style="color:#CFA030; font-size:0.85rem;"></i>
                        <span id="t-client"
                            style="color:var(--text-main); font-size:0.75rem; font-weight:700; letter-spacing:0.04em; text-transform:uppercase;">Espace
                            Client</span>
                    </div>
                    <h1 class="syne" id="t-login"
                        style="font-size:1.8rem; font-weight:800; color:var(--navy); margin:0 0 6px;">Connexion</h1>
                    <p id="t-access" style="color:var(--text-muted); font-size:0.875rem; margin:0;">Accédez à votre
                        portail d'importation</p>
                </div>

                @if(session('error'))
                    <div class="fade-up-2"
                        style="background:#FEF2F2; border:1px solid #FECACA; border-radius:10px; padding:12px 16px; margin-bottom:1.25rem; display:flex; align-items:flex-start; gap:10px;">
                        <i class="fas fa-exclamation-circle" style="color:#EF4444; margin-top:2px; flex-shrink:0;"></i>
                        <span style="color:#B91C1C; font-size:0.85rem;">{{ session('error') }}</span>
                    </div>
                @endif

                @if(session('success'))
                    <div class="fade-up-2"
                        style="background:#ECFDF5; border:1px solid #A7F3D0; border-radius:10px; padding:12px 16px; margin-bottom:1.25rem; display:flex; align-items:flex-start; gap:10px;">
                        <i class="fas fa-check-circle" style="color:#059669; margin-top:2px; flex-shrink:0;"></i>
                        <span style="color:#065F46; font-size:0.85rem;">{{ session('success') }}</span>
                    </div>
                @endif

                <form method="POST" action="{{ route('client.login.post') }}" class="fade-up-2">
                    @csrf
                    <div style="margin-bottom:1.2rem;">
                        <label id="t-email-lbl"
                            style="display:block; font-size:0.82rem; font-weight:600; color:var(--text-main); margin-bottom:8px;">
                            Adresse email
                        </label>
                        <div style="position:relative;">
                            <i class="fas fa-envelope input-icon"></i>
                            <input type="email" name="email" value="{{ old('email') }}" required autofocus
                                id="inp-email" class="input-field {{ $errors->has('email') ? 'error' : '' }}"
                                placeholder="contact@votre-entreprise.dz">
                        </div>
                        @error('email')<p style="color:#EF4444; font-size:0.75rem; margin:4px 0 0;">{{ $message }}</p>
                        @enderror
                    </div>

                    <div style="margin-bottom:0.75rem;">
                        <label id="t-pwd-lbl"
                            style="display:block; font-size:0.82rem; font-weight:600; color:var(--text-main); margin-bottom:8px;">
                            Mot de passe
                        </label>
                        <div style="position:relative;">
                            <i class="fas fa-lock input-icon"></i>
                            <input type="password" name="password" required id="inp-pwd"
                                class="input-field {{ $errors->has('password') ? 'error' : '' }}"
                                placeholder="••••••••">
                            <button type="button" class="eye-btn" onclick="togglePwd()"><i id="eye-ico"
                                    class="fas fa-eye"></i></button>
                        </div>
                        @error('password')<p style="color:#EF4444; font-size:0.75rem; margin:4px 0 0;">{{ $message }}
                        </p>@enderror
                    </div>

                    <div style="text-align:right; margin-bottom:1.75rem;">
                        <a href="#" id="t-forgot"
                            style="font-size:0.78rem; color:var(--navy); text-decoration:none; font-weight:600;">Mot de
                            passe oublié ?</a>
                    </div>

                    <button type="submit" class="btn-primary">
                        <span id="t-signin">Se connecter</span>
                        <i class="fas fa-arrow-right" style="font-size:0.8rem;"></i>
                    </button>
                </form>

                <p class="fade-up-3"
                    style="text-align:center; font-size:0.85rem; color:var(--text-muted); margin-top:1.5rem;">
                    <span id="t-noaccount">Pas encore de compte ?</span>
                    <a href="{{ route('client.register') }}" id="t-register"
                        style="color:var(--gold); font-weight:700; text-decoration:none; margin-left:4px;">S'inscrire</a>
                </p>
            </div>
        </div>
    </div>

    <script>
        const TR = {
            fr: {
                dir: 'ltr', lang: 'fr',
                back: "Retour à l'accueil", portal: "Portail Importateur", port: "Port de Mostaganem — Algérie",
                f1: "Soumettez vos demandes d'importation", f2: "Suivez vos contrats et factures", f3: "Téléchargez vos documents PDF",
                client: "Espace Client", login: "Connexion", access: "Accédez à votre portail d'importation",
                emailLbl: "Adresse email", emailPl: "contact@votre-entreprise.dz",
                pwdLbl: "Mot de passe", pwdPl: "••••••••",
                forgot: "Mot de passe oublié ?", signin: "Se connecter",
                noAccount: "Pas encore de compte ?", register: "S'inscrire",
                backMob: "Accueil"
            },
            en: {
                dir: 'ltr', lang: 'en',
                back: "Back to homepage", portal: "Importer Portal", port: "Port of Mostaganem — Algeria",
                f1: "Submit your import requests", f2: "Track your contracts and invoices", f3: "Download your PDF documents",
                client: "Client Area", login: "Login", access: "Access your import portal",
                emailLbl: "Email address", emailPl: "contact@your-company.dz",
                pwdLbl: "Password", pwdPl: "••••••••",
                forgot: "Forgot password?", signin: "Sign in",
                noAccount: "Don't have an account yet?", register: "Sign Up",
                backMob: "Home"
            },
            ar: {
                dir: 'rtl', lang: 'ar',
                back: "العودة إلى الصفحة الرئيسية", portal: "بوابة المستورد", port: "ميناء مستغانم — الجزائر",
                f1: "أرسل طلبات الاستيراد الخاصة بك", f2: "تتبع العقود والفواتير الخاصة بك", f3: "قم بتنزيل مستندات PDF الخاصة بك",
                client: "منطقة العميل", login: "تسجيل الدخول", access: "الوصول إلى بوابة الاستيراد الخاصة بك",
                emailLbl: "عنوان البريد الإلكتروني", emailPl: "contact@شركتك.dz",
                pwdLbl: "كلمة المرور", pwdPl: "••••••••",
                forgot: "هل نسيت كلمة المرور؟", signin: "تسجيل الدخول",
                noAccount: "ليس لديك حساب بعد؟", register: "إنشاء حساب",
                backMob: "الرئيسية"
            }
        };

        function setText(id, val) { const e = document.getElementById(id); if (e) e.textContent = val; }
        function setAttr(id, attr, val) { const e = document.getElementById(id); if (e) e.setAttribute(attr, val); }

        function setLang(lang) {
            const t = TR[lang];
            document.getElementById('html-root').setAttribute('dir', t.dir);
            document.getElementById('html-root').setAttribute('lang', t.lang);
            document.body.className = t.dir === 'rtl' ? 'lang-ar' : '';

            ['fr', 'en', 'ar'].forEach(l => document.getElementById('btn-' + l).classList.toggle('active', l === lang));

            const rtl = t.dir === 'rtl';
            setAttr('back-ico', 'class', 'fas fa-arrow-' + (rtl ? 'right' : 'left'));
            setAttr('back-mob-ico', 'class', 'fas fa-arrow-' + (rtl ? 'right' : 'left'));

            setText('t-back', t.back); setText('t-backmob', t.backMob);
            setText('t-portal', t.portal); setText('t-port', t.port);
            setText('t-f1', t.f1); setText('t-f2', t.f2); setText('t-f3', t.f3);
            setText('t-client', t.client); setText('t-login', t.login); setText('t-access', t.access);

            setText('t-email-lbl', t.emailLbl); setAttr('inp-email', 'placeholder', t.emailPl);
            setText('t-pwd-lbl', t.pwdLbl); setAttr('inp-pwd', 'placeholder', t.pwdPl);

            setText('t-forgot', t.forgot); setText('t-signin', t.signin);
            setText('t-noaccount', t.noAccount); setText('t-register', t.register);
        }

        function togglePwd() {
            const inp = document.getElementById('inp-pwd');
            const ico = document.getElementById('eye-ico');
            if (inp.type === 'password') {
                inp.type = 'text'; ico.className = 'fas fa-eye-slash';
            } else {
                inp.type = 'password'; ico.className = 'fas fa-eye';
            }
        }
    </script>
</body>

</html>