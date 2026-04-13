<!DOCTYPE html>
<html lang="{{ $lang }}" dir="{{ $lang === 'ar' ? 'rtl' : 'ltr' }}">
<head>
    <meta charset="utf-8">
    <title>
        @if($lang === 'ar')كلمة مرورك المؤقتة الجديدة — GSLC NASHCO
        @elseif($lang === 'en')Your new temporary password — GSLC NASHCO
        @else Nouveau mot de passe temporaire — GSLC NASHCO
        @endif
    </title>
</head>
<body style="font-family: Arial, sans-serif; background: #f4f6fa; margin: 0; padding: 32px 0;">

    <div style="max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">

        {{-- Header --}}
        <div style="background: #0D1F3C; padding: 28px 32px; display: flex; align-items: center; gap: 12px;">
            <div style="width: 40px; height: 40px; background: rgba(207,160,48,0.15); border-radius: 10px; display: flex; align-items: center; justify-content: center;">
                <span style="color: #CFA030; font-size: 20px;">🔑</span>
            </div>
            <div>
                <p style="margin: 0; color: rgba(255,255,255,0.5); font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em;">GSLC NASHCO</p>
                <h2 style="margin: 2px 0 0; color: #ffffff; font-size: 16px; font-weight: 700;">
                    @if($lang === 'ar')كلمة مرور مؤقتة جديدة
                    @elseif($lang === 'en')New temporary password
                    @else Nouveau mot de passe temporaire
                    @endif
                </h2>
            </div>
        </div>

        {{-- Body --}}
        <div style="padding: 32px;">

            <p style="margin: 0 0 16px; color: #0D1F3C; font-size: 15px; font-weight: 600;">
                @if($lang === 'ar')مرحباً {{ $staffUser->prenom }} {{ $staffUser->nom }}،
                @elseif($lang === 'en')Hello {{ $staffUser->prenom }} {{ $staffUser->nom }},
                @else Bonjour {{ $staffUser->prenom }} {{ $staffUser->nom }},
                @endif
            </p>

            <p style="margin: 0 0 24px; color: #475569; font-size: 14px; line-height: 1.7;">
                @if($lang === 'ar')تم إعادة تعيين كلمة مرورك من قِبَل المسؤول في
                @elseif($lang === 'en')Your password was reset by the administrator on
                @else Votre mot de passe a été réinitialisé par l'administrateur le
                @endif
                <strong>{{ $resetAt }}</strong>.
            </p>

            {{-- Password box --}}
            <div style="background: #F8FAFC; border: 2px solid #CFA030; border-radius: 10px; padding: 20px 24px; margin-bottom: 24px; text-align: center;">
                <p style="margin: 0 0 8px; color: #64748B; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 700;">
                    @if($lang === 'ar')كلمة المرور المؤقتة
                    @elseif($lang === 'en')Temporary password
                    @else Mot de passe temporaire
                    @endif
                </p>
                <p style="margin: 0; font-family: 'Courier New', Courier, monospace; color: #0D1F3C; font-size: 22px; font-weight: 700; letter-spacing: 0.15em;">{{ $newPassword }}</p>
            </div>

            <div style="background: #FFF7ED; border-left: 4px solid #F97316; border-radius: 0 8px 8px 0; padding: 14px 18px; margin-bottom: 24px;">
                <p style="margin: 0; color: #7C2D12; font-size: 13px; line-height: 1.6;">
                    ⚠
                    @if($lang === 'ar')كلمة المرور هذه <strong>مؤقتة</strong>. ستحتاج إلى تغييرها عند تسجيل الدخول التالي.
                    @elseif($lang === 'en')This password is <strong>temporary</strong>. You will need to change it on your next login.
                    @else Ce mot de passe est <strong>temporaire</strong>. Vous devrez le changer lors de votre prochaine connexion.
                    @endif
                </p>
            </div>

            <p style="margin: 0 0 20px; color: #475569; font-size: 14px; line-height: 1.7;">
                @if($lang === 'ar')تسجيل الدخول على :
                @elseif($lang === 'en')Log in at:
                @else Connectez-vous sur :
                @endif
                <a href="{{ url('/staff/login') }}"
                   style="color: #CFA030; font-weight: 600; text-decoration: none;">
                    {{ url('/staff/login') }}
                </a>
            </p>

            <div style="background: #FEF2F2; border-left: 4px solid #EF4444; border-radius: 0 8px 8px 0; padding: 14px 18px; margin-bottom: 28px;">
                <p style="margin: 0; color: #991B1B; font-size: 13px; line-height: 1.6;">
                    @if($lang === 'ar')إذا لم تطلب إعادة التعيين هذه، تواصل مع المسؤول <strong>فوراً</strong>.
                    @elseif($lang === 'en')If you did not request this reset, contact the administrator <strong>immediately</strong>.
                    @else Si vous n'avez pas demandé cette réinitialisation, contactez <strong>immédiatement</strong> l'administrateur.
                    @endif
                </p>
            </div>

            <p style="margin: 0; color: #64748b; font-size: 13px; line-height: 1.6;">
                @if($lang === 'ar')مع التحية،<br><strong>فريق NASHCO GSLC</strong>
                @elseif($lang === 'en')Best regards,<br><strong>The NASHCO GSLC Team</strong>
                @else Cordialement,<br><strong>L'équipe NASHCO GSLC</strong>
                @endif
            </p>
        </div>

        {{-- Footer --}}
        <div style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px 32px; text-align: center;">
            <p style="margin: 0; color: #94a3b8; font-size: 11px;">
                © {{ date('Y') }} EPE NASHCO Spa — Groupe GATMA &nbsp;|&nbsp; Cet email a été généré automatiquement suite à une action administrateur.
            </p>
        </div>
    </div>

</body>
</html>
