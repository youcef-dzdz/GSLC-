<!DOCTYPE html>
<html lang="fr" id="html-root" dir="ltr">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GSLC — Inscription Importateur</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link
        href="https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500;600&family=Noto+Sans+Arabic:wght@300;400;500;600;700&display=swap"
        rel="stylesheet">
    @vite(['resources/css/app.css', 'resources/js/app.tsx'])
    <style>
        :root {
            --navy: #0D1F3C;
            --blue: #1A4A8C;
            --gold: #CFA030;
            --gold-l: #e8b840;
            --bg: #EDF0F5;
            --white: #ffffff;
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            min-height: 100vh;
            background: var(--bg);
            font-family: 'DM Sans', sans-serif;
            position: relative;
        }

        /* Language Support - Fixed Icon Override */
        body.lang-ar,
        body.lang-ar *:not(i):not(.fas):not(.far):not(.fab):not(.fa-solid) {
            font-family: 'Noto Sans Arabic', sans-serif !important;
        }

        .syne {
            font-family: 'Syne', sans-serif;
        }

        body.lang-ar .syne {
            font-family: 'Noto Sans Arabic', sans-serif !important;
            font-weight: 700;
        }

        /* Background image with overlay */
        .page-bg {
            position: fixed;
            inset: 0;
            z-index: 0;
            background-image: url('{{ asset("images/hero4.jpg") }}');
            background-size: cover;
            background-position: center;
            filter: brightness(0.35) saturate(0.7);
        }

        .page-bg-overlay {
            position: fixed;
            inset: 0;
            z-index: 1;
            background: linear-gradient(160deg,
                    rgba(13, 31, 60, 0.82) 0%,
                    rgba(13, 31, 60, 0.55) 40%,
                    rgba(8, 18, 32, 0.75) 100%);
        }

        @keyframes fadeUp {
            from {
                opacity: 0;
                transform: translateY(14px);
            }

            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .fu {
            animation: fadeUp 0.42s ease-out both;
        }

        .fu2 {
            animation: fadeUp 0.42s ease-out 0.08s both;
        }

        .fu3 {
            animation: fadeUp 0.42s ease-out 0.16s both;
        }

        .fu4 {
            animation: fadeUp 0.42s ease-out 0.24s both;
        }

        .page-wrap {
            position: relative;
            z-index: 2;
            max-width: 840px;
            margin: 0 auto;
            padding: 2rem 1rem 3rem;
        }

        /* Top bar */
        .top-bar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 1.25rem;
        }

        .back-link {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            color: rgba(255, 255, 255, 0.75);
            font-size: 0.82rem;
            font-weight: 500;
            text-decoration: none;
            transition: color 0.2s;
        }

        .back-link:hover {
            color: var(--gold);
        }

        /* Lang switcher */
        .lang-sw {
            display: flex;
            align-items: center;
            gap: 3px;
            background: rgba(255, 255, 255, 0.12);
            border-radius: 24px;
            padding: 3px;
            backdrop-filter: blur(8px);
        }

        .lang-btn {
            padding: 5px 13px;
            border-radius: 20px;
            font-size: 0.72rem;
            font-weight: 700;
            letter-spacing: 0.04em;
            border: none;
            cursor: pointer;
            transition: all 0.2s;
            background: transparent;
            color: rgba(255, 255, 255, 0.65);
        }

        .lang-btn.active {
            background: var(--white);
            color: var(--navy);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        }

        .lang-btn:not(.active):hover {
            background: rgba(255, 255, 255, 0.15);
            color: #fff;
        }

        /* Page header card */
        .page-header {
            background: rgba(255, 255, 255, 0.96);
            backdrop-filter: blur(12px);
            border-radius: 14px;
            border: 1px solid rgba(255, 255, 255, 0.9);
            border-left: 4px solid var(--gold);
            padding: 1.25rem 1.5rem;
            margin-bottom: 1.25rem;
            display: flex;
            align-items: center;
            justify-content: space-between;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        }

        [dir="rtl"] .page-header {
            border-left: 1px solid rgba(255, 255, 255, 0.9);
            border-right: 4px solid var(--gold);
        }

        /* Steps */
        .steps {
            display: flex;
            align-items: center;
            background: rgba(255, 255, 255, 0.96);
            backdrop-filter: blur(12px);
            border-radius: 12px;
            padding: 14px 20px;
            margin-bottom: 1.25rem;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
        }

        .step {
            display: flex;
            align-items: center;
            gap: 8px;
            flex: 1;
        }

        .step-dot {
            width: 28px;
            height: 28px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.75rem;
            font-weight: 700;
            flex-shrink: 0;
        }

        .s-active .step-dot {
            background: var(--gold);
            color: #fff;
        }

        .s-done .step-dot {
            background: var(--navy);
            color: #fff;
        }

        .s-off .step-dot {
            background: #E2E8F0;
            color: #94A3B8;
        }

        .step-lbl {
            font-size: 0.75rem;
            font-weight: 500;
            color: #64748B;
            white-space: nowrap;
        }

        .s-active .step-lbl {
            color: var(--navy);
            font-weight: 600;
        }

        .step-line {
            flex: 1;
            height: 1px;
            background: #E2E8F0;
            margin: 0 8px;
        }

        @media(max-width:520px) {
            .step-lbl {
                display: none;
            }
        }

        /* Section cards */
        .sc {
            background: rgba(255, 255, 255, 0.97);
            backdrop-filter: blur(12px);
            border-radius: 14px;
            border: 1px solid rgba(255, 255, 255, 0.9);
            overflow: hidden;
            margin-bottom: 1.25rem;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
        }

        .sc-hd {
            background: linear-gradient(135deg, #F7F9FC 0%, #EDF0F5 100%);
            border-bottom: 1px solid #E2E8F0;
            padding: 0.9rem 1.5rem;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .sc-ico {
            width: 30px;
            height: 30px;
            background: rgba(207, 160, 48, 0.12);
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
        }

        .sc-ico i {
            color: var(--gold);
            font-size: 0.85rem;
        }

        .sc-body {
            padding: 1.5rem;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1.1rem;
        }

        @media(max-width:640px) {
            .sc-body {
                grid-template-columns: 1fr;
            }

            .col2 {
                grid-column: 1 !important;
            }
        }

        .col2 {
            grid-column: 1 / -1;
        }

        /* Fields */
        .flbl {
            display: block;
            font-size: 0.8rem;
            font-weight: 600;
            color: #374151;
            margin-bottom: 6px;
            letter-spacing: 0.01em;
        }

        .freq {
            color: #EF4444;
            margin-left: 2px;
        }

        .inp {
            width: 100%;
            border: 1.5px solid #E2E8F0;
            border-radius: 9px;
            padding: 10px 12px;
            font-size: 0.875rem;
            background: #FAFBFC;
            color: #1e293b;
            font-family: inherit;
            transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
            outline: none;
        }

        .inp:focus {
            border-color: var(--blue);
            box-shadow: 0 0 0 3px rgba(26, 74, 140, 0.09);
            background: #fff;
        }

        .inp.err {
            border-color: #EF4444;
            background: #fff8f8;
        }

        .inp.mono {
            font-family: 'DM Mono', 'Courier New', monospace;
            letter-spacing: 0.04em;
        }

        .ferr {
            color: #EF4444;
            font-size: 0.75rem;
            margin-top: 4px;
            display: block;
        }

        select.inp {
            cursor: pointer;
        }

        textarea.inp {
            resize: none;
        }

        /* Alert */
        .alert {
            border-radius: 12px;
            padding: 14px 16px;
            margin-bottom: 1.25rem;
            display: flex;
            align-items: flex-start;
            gap: 10px;
        }

        .alert-err {
            background: #FEF2F2;
            border: 1px solid #FECACA;
            color: #B91C1C;
            font-size: 0.85rem;
        }

        /* Footer bar */
        .form-foot {
            background: rgba(255, 255, 255, 0.97);
            backdrop-filter: blur(12px);
            border-radius: 14px;
            border: 1px solid rgba(255, 255, 255, 0.9);
            padding: 1.25rem 1.5rem;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 1rem;
            flex-wrap: wrap;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
        }

        .btn-sec {
            background: #fff;
            border: 1.5px solid #E2E8F0;
            color: #374151;
            font-weight: 500;
            font-size: 0.875rem;
            font-family: inherit;
            padding: 10px 20px;
            border-radius: 9px;
            cursor: pointer;
            text-decoration: none;
            transition: background 0.2s, border-color 0.2s;
            display: inline-flex;
            align-items: center;
            gap: 7px;
        }

        .btn-sec:hover {
            background: #F0F4F8;
            border-color: #CBD5E1;
        }

        .btn-pri {
            background: linear-gradient(135deg, var(--navy) 0%, var(--blue) 100%);
            color: #fff;
            font-weight: 700;
            font-size: 0.9rem;
            font-family: inherit;
            padding: 11px 28px;
            border-radius: 9px;
            border: none;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            transition: opacity 0.2s, transform 0.15s;
            box-shadow: 0 4px 16px rgba(13, 31, 60, 0.25);
        }

        .btn-pri:hover {
            opacity: .9;
            transform: translateY(-1px);
        }

        .btn-pri:active {
            transform: translateY(0);
        }
    </style>
</head>

<body class="fu">

    <div class="page-bg"></div>
    <div class="page-bg-overlay"></div>

    <div class="page-wrap">

        <div class="top-bar fu">
            <a href="/" class="back-link" id="back-lnk">
                <i class="fas fa-arrow-left" id="back-ico"></i>
                <span id="t-back">Retour à l'accueil</span>
            </a>
            <div class="lang-sw">
                <button class="lang-btn" id="btn-ar" onclick="setLang('ar')">العربية</button>
                <button class="lang-btn active" id="btn-fr" onclick="setLang('fr')">FR</button>
                <button class="lang-btn" id="btn-en" onclick="setLang('en')">EN</button>
            </div>
        </div>

        <div class="page-header fu2">
            <div>
                <h1 class="syne" style="font-size:1.5rem;font-weight:800;color:var(--navy);margin-bottom:4px;"
                    id="t-title">Nouvelle Inscription</h1>
                <p style="color:#94A3B8;font-size:0.82rem;" id="t-titlesub">Demande d'accès au portail importateur GSLC
                    — Port de Mostaganem</p>
            </div>
            <img src="{{ asset('images/nashco_logo Company.jpg') }}" alt="NASHCO"
                style="height:44px;width:auto;object-fit:contain;background:#fff;border-radius:9px;padding:4px 8px;border:1px solid #E2E8F0;">
        </div>

        <div class="steps fu2">
            <div class="step s-active">
                <div class="step-dot">1</div>
                <span class="step-lbl" id="t-s1">Entreprise</span>
            </div>
            <div class="step-line"></div>
            <div class="step s-active">
                <div class="step-dot">2</div>
                <span class="step-lbl" id="t-s2">Représentant</span>
            </div>
            <div class="step-line"></div>
            <div class="step s-off">
                <div class="step-dot">3</div>
                <span class="step-lbl" id="t-s3">Confirmation</span>
            </div>
        </div>

        @if(session('error'))
            <div class="alert alert-err fu2">
                <i class="fas fa-exclamation-circle" style="color:#EF4444;flex-shrink:0;margin-top:2px;"></i>
                <span>{{ session('error') }}</span>
            </div>
        @endif

        @if($errors->any())
            <div class="alert alert-err fu2">
                <i class="fas fa-triangle-exclamation" style="color:#EF4444;flex-shrink:0;margin-top:2px;"></i>
                <div>
                    <p style="font-weight:600;margin-bottom:6px;" id="t-err-hd">Veuillez corriger les erreurs :</p>
                    <ul style="padding-left:1.1rem;line-height:1.7;font-size:0.8rem;">
                        @foreach($errors->all() as $error)<li>{{ $error }}</li>@endforeach
                    </ul>
                </div>
            </div>
        @endif

        <form method="POST" action="{{ route('client.register.post') }}">
            @csrf

            <div class="sc fu2">
                <div class="sc-hd">
                    <div class="sc-ico"><i class="fas fa-building"></i></div>
                    <h2 class="syne" style="font-size:0.88rem;font-weight:700;color:var(--navy);" id="t-s1h">
                        Informations de l'Entreprise</h2>
                </div>
                <div class="sc-body">
                    <div class="col2">
                        <label class="flbl" id="t-rs">Raison Sociale <span class="freq">*</span></label>
                        <input type="text" name="raison_sociale" value="{{ old('raison_sociale') }}" required
                            class="inp {{ $errors->has('raison_sociale') ? 'err' : '' }}" id="inp-rs"
                            placeholder="Ex: SARL IMPORT EXPORT">
                    </div>
                    <div>
                        <label class="flbl">NIF (Numéro d'Identification Fiscale)</label>
                        <input type="text" name="nif" value="{{ old('nif') }}"
                            class="inp mono {{ $errors->has('nif') ? 'err' : '' }}" id="inp-nif"
                            placeholder="15 chiffres...">
                    </div>
                    <div>
                        <label class="flbl">NIS (Numéro d'Identification Statistique)</label>
                        <input type="text" name="nis" value="{{ old('nis') }}"
                            class="inp mono {{ $errors->has('nis') ? 'err' : '' }}" id="inp-nis"
                            placeholder="15 chiffres...">
                    </div>
                    <div>
                        <label class="flbl" id="t-rc">Registre de Commerce <span class="freq">*</span></label>
                        <input type="text" name="rc" value="{{ old('rc') }}" required
                            class="inp mono {{ $errors->has('rc') ? 'err' : '' }}" id="inp-rc"
                            placeholder="Ex: 12B3456789">
                    </div>
                    <div>
                        <label class="flbl" id="t-tc">Type de Client <span class="freq">*</span></label>
                        <select name="type_client" required class="inp {{ $errors->has('type_client') ? 'err' : '' }}">
                            <option value="" disabled selected id="t-sel">— Sélectionner —</option>
                            <option value="ORDINAIRE" @if(old('type_client') == 'ORDINAIRE') selected @endif id="t-ord">Ordinaire</option>
                            <option value="EN_PNUE" @if(old('type_client') == 'EN_PNUE') selected @endif id="t-enpnue">EN PNUE</option>
                            <option value="EXPORTATEUR" @if(old('type_client') == 'EXPORTATEUR') selected @endif id="t-exp">Exportateur</option>
                        </select>
                    </div>
                    <div class="col2">
                        <label class="flbl" id="t-adr">Adresse du Siège <span class="freq">*</span></label>
                        <textarea name="adresse_siege" rows="2" required class="inp {{ $errors->has('adresse_siege') ? 'err' : '' }}"
                            id="inp-adr" placeholder="Adresse complète de l'entreprise">{{ old('adresse_siege') }}</textarea>
                    </div>
                    <div>
                        <label class="flbl" id="t-vil">Ville <span class="freq">*</span></label>
                        <input type="text" name="ville" value="{{ old('ville') }}" required
                            class="inp {{ $errors->has('ville') ? 'err' : '' }}" id="inp-vil" placeholder="Ex: Alger">
                    </div>
                    <div>
                        <label class="flbl" id="t-pay">Pays <span class="freq">*</span></label>
                        <select name="pays_id" required class="inp {{ $errors->has('pays_id') ? 'err' : '' }}">
                            <option value="">— Sélectionner —</option>
                            @foreach($pays as $p)
                                <option value="{{ $p->id }}" @if(old('pays_id', 1) == $p->id) selected @endif>{{ $p->nom_pays }}</option>
                            @endforeach
                        </select>
                    </div>
                </div>
            </div>

            <div class="sc fu3">
                <div class="sc-hd">
                    <div class="sc-ico"><i class="fas fa-user-tie"></i></div>
                    <h2 class="syne" style="font-size:0.88rem;font-weight:700;color:var(--navy);" id="t-s2h">
                        Informations du Représentant</h2>
                </div>
                <div class="sc-body">
                    <div>
                        <label class="flbl" id="t-nom">Nom <span class="freq">*</span></label>
                        <input type="text" name="rep_nom" value="{{ old('rep_nom') }}" required
                            class="inp {{ $errors->has('rep_nom') ? 'err' : '' }}" id="inp-nom" placeholder="Votre nom">
                    </div>
                    <div>
                        <label class="flbl" id="t-prn">Prénom <span class="freq">*</span></label>
                        <input type="text" name="rep_prenom" value="{{ old('rep_prenom') }}" required
                            class="inp {{ $errors->has('rep_prenom') ? 'err' : '' }}" id="inp-prn" placeholder="Votre prénom">
                    </div>
                    <div>
                        <label class="flbl" id="t-fon">Fonction <span class="freq">*</span></label>
                        <input type="text" name="rep_role" value="{{ old('rep_role') }}" required
                            class="inp {{ $errors->has('rep_role') ? 'err' : '' }}" id="inp-fon"
                            placeholder="Ex: Gérant, Directeur...">
                    </div>
                    <div>
                        <label class="flbl" id="t-tel">Téléphone <span class="freq">*</span></label>
                        <input type="tel" name="rep_tel" value="{{ old('rep_tel') }}" required
                            class="inp mono {{ $errors->has('rep_tel') ? 'err' : '' }}" id="inp-tel"
                            placeholder="05XX XX XX XX">
                    </div>
                    <div class="col2">
                        <label class="flbl" id="t-eml">Adresse Email de Connexion <span class="freq">*</span></label>
                        <input type="email" name="rep_email" value="{{ old('rep_email') }}" required
                            class="inp mono {{ $errors->has('rep_email') ? 'err' : '' }}" id="inp-eml"
                            placeholder="contact@entreprise.dz">
                    </div>
                    <div>
                        <label class="flbl" id="t-mdp">Mot de Passe <span class="freq">*</span></label>
                        <input type="password" name="password" required
                            class="inp {{ $errors->has('password') ? 'err' : '' }}" id="inp-mdp" placeholder="••••••••">
                    </div>
                    <div>
                        <label class="flbl" id="t-cmp">Confirmer le Mot de Passe <span class="freq">*</span></label>
                        <input type="password" name="password_confirmation" required class="inp" id="inp-cmp"
                            placeholder="••••••••">
                    </div>
                </div>
            </div>

            <div class="form-foot fu4">
                <a href="{{ route('client.login') }}" class="btn-sec">
                    <i class="fas fa-times" id="btn-c-ico"></i> <span id="t-btn-c">Annuler</span>
                </a>
                <button type="submit" class="btn-pri">
                    <span id="t-btn-s">Soumettre la Demande</span> <i class="fas fa-arrow-right" id="btn-s-ico"></i>
                </button>
            </div>

        </form>
    </div>

    <script>
        const TR = {
            fr: {
                back: "Retour à l'accueil", title: "Nouvelle Inscription", titlesub: "Demande d'accès au portail importateur GSLC — Port de Mostaganem",
                s1: "Entreprise", s2: "Représentant", s3: "Confirmation",
                s1h: "Informations de l'Entreprise", s2h: "Informations du Représentant",
                errHd: "Veuillez corriger les erreurs :",
                rs: "Raison Sociale", rs_p: "Ex: SARL IMPORT EXPORT", nif_p: "15 chiffres...", nis_p: "15 chiffres...",
                rc: "Registre de Commerce", rc_p: "Ex: 12B3456789", tc: "Type de Client", sel: "— Sélectionner —", ord: "Ordinaire", exp: "Exceptionnel",
                adr: "Adresse du Siège", adr_p: "Adresse complète de l'entreprise", vil: "Ville", vil_p: "Ex: Alger", pay: "Pays",
                nom: "Nom", nom_p: "Votre nom", prn: "Prénom", prn_p: "Votre prénom", fon: "Fonction", fon_p: "Ex: Gérant, Directeur...",
                tel: "Téléphone", tel_p: "05XX XX XX XX", eml: "Adresse Email de Connexion", eml_p: "contact@entreprise.dz",
                mdp: "Mot de Passe", cmp: "Confirmer le Mot de Passe",
                btn_c: "Annuler", btn_s: "Soumettre la Demande"
            },
            en: {
                back: "Back to Home", title: "New Registration", titlesub: "Access request for GSLC Importer Portal — Port of Mostaganem",
                s1: "Company", s2: "Representative", s3: "Confirmation",
                s1h: "Company Information", s2h: "Representative Information",
                errHd: "Please correct the following errors:",
                rs: "Company Name", rs_p: "Ex: SARL IMPORT EXPORT", nif_p: "15 digits...", nis_p: "15 digits...",
                rc: "Commercial Register", rc_p: "Ex: 12B3456789", tc: "Client Type", sel: "— Select —", ord: "Ordinary", exp: "Exceptional",
                adr: "Headquarters Address", adr_p: "Full company address", vil: "City", vil_p: "Ex: Algiers", pay: "Country",
                nom: "Last Name", nom_p: "Your last name", prn: "First Name", prn_p: "Your first name", fon: "Position", fon_p: "Ex: Manager, Director...",
                tel: "Phone", tel_p: "05XX XX XX XX", eml: "Login Email Address", eml_p: "contact@company.dz",
                mdp: "Password", cmp: "Confirm Password",
                btn_c: "Cancel", btn_s: "Submit Request"
            },
            ar: {
                back: "العودة للرئيسية", title: "تسجيل جديد", titlesub: "طلب الوصول إلى بوابة المستورد GSLC — ميناء مستغانم",
                s1: "الشركة", s2: "الممثل", s3: "تأكيد",
                s1h: "معلومات الشركة", s2h: "معلومات الممثل",
                errHd: "يرجى تصحيح الأخطاء التالية:",
                rs: "اسم الشركة", rs_p: "مثال: ش.ذ.م.م استيراد وتصدير", nif_p: "15 رقم...", nis_p: "15 رقم...",
                rc: "السجل التجاري", rc_p: "مثال: 12B3456789", tc: "نوع العميل", sel: "— اختر —", ord: "عادي", exp: "استثنائي",
                adr: "عنوان المقر", adr_p: "عنوان الشركة الكامل", vil: "المدينة", vil_p: "مثال: الجزائر", pay: "البلد",
                nom: "اللقب", nom_p: "لقبك", prn: "الاسم", prn_p: "اسمك", fon: "المنصب", fon_p: "مثال: مسير، مدير...",
                tel: "الهاتف", tel_p: "05XX XX XX XX", eml: "البريد الإلكتروني لتسجيل الدخول", eml_p: "contact@company.dz",
                mdp: "كلمة المرور", cmp: "تأكيد كلمة المرور",
                btn_c: "إلغاء", btn_s: "إرسال الطلب"
            }
        };

        function setText(id, txt) { const el = document.getElementById(id); if (el) el.innerText = txt; }
        function setAttr(id, attr, val) { const el = document.getElementById(id); if (el) el.setAttribute(attr, val); }

        function setLang(l) {
            document.getElementById('btn-fr').className = (l === 'fr' ? 'lang-btn active' : 'lang-btn');
            document.getElementById('btn-en').className = (l === 'en' ? 'lang-btn active' : 'lang-btn');
            document.getElementById('btn-ar').className = (l === 'ar' ? 'lang-btn active' : 'lang-btn');

            const isAr = (l === 'ar');
            document.getElementById('html-root').dir = isAr ? 'rtl' : 'ltr';
            document.getElementById('html-root').lang = l;
            document.body.className = isAr ? 'lang-ar fu' : 'fu';

            if (isAr) {
                document.getElementById('back-ico').className = 'fas fa-arrow-right';
                document.getElementById('btn-s-ico').className = 'fas fa-arrow-left';
            } else {
                document.getElementById('back-ico').className = 'fas fa-arrow-left';
                document.getElementById('btn-s-ico').className = 'fas fa-arrow-right';
            }

            const t = TR[l];
            setText('t-back', t.back); setText('t-title', t.title); setText('t-titlesub', t.titlesub);
            setText('t-s1', t.s1); setText('t-s2', t.s2); setText('t-s3', t.s3);
            setText('t-s1h', t.s1h); setText('t-s2h', t.s2h);
            setText('t-err-hd', t.errHd);

            setText('t-rs', t.rs + ' *'); setAttr('inp-rs', 'placeholder', t.rs_p);
            setAttr('inp-nif', 'placeholder', t.nif_p); setAttr('inp-nis', 'placeholder', t.nis_p);
            setText('t-rc', t.rc + ' *'); setAttr('inp-rc', 'placeholder', t.rc_p);
            setText('t-tc', t.tc + ' *');
            setText('t-sel', t.sel); setText('t-ord', t.ord); setText('t-exp', t.exp);
            setText('t-adr', t.adr + ' *'); setAttr('inp-adr', 'placeholder', t.adr_p);
            setText('t-vil', t.vil + ' *'); setAttr('inp-vil', 'placeholder', t.vil_p);
            setText('t-pay', t.pay + ' *');

            setText('t-nom', t.nom + ' *'); setAttr('inp-nom', 'placeholder', t.nom_p);
            setText('t-prn', t.prn + ' *'); setAttr('inp-prn', 'placeholder', t.prn_p);
            setText('t-fon', t.fon); setAttr('inp-fon', 'placeholder', t.fon_p);
            setText('t-tel', t.tel + ' *'); setAttr('inp-tel', 'placeholder', t.tel_p);
            setText('t-eml', t.eml + ' *'); setAttr('inp-eml', 'placeholder', t.eml_p);
            setText('t-mdp', t.mdp + ' *'); setText('t-cmp', t.cmp + ' *');

            setText('t-btn-c', t.btn_c); setText('t-btn-s', t.btn_s);
        }
    </script>
</body>

</html>