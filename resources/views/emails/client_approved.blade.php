<!DOCTYPE html>
<html lang="{{ $lang }}" dir="{{ $lang === 'ar' ? 'rtl' : 'ltr' }}">
<head>
    <meta charset="utf-8">
    <title>
        @if($lang === 'ar')تم تفعيل الحساب — GSLC NASHCO
        @elseif($lang === 'en')Account activated — GSLC NASHCO
        @else Compte activé — GSLC NASHCO
        @endif
    </title>
</head>
<body style="font-family: Arial, sans-serif; background: #f4f6fa; margin: 0; padding: 32px 0;">

    <div style="max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">

        {{-- Header --}}
        <div style="background: #0D1F3C; padding: 28px 32px; display: flex; align-items: center; gap: 12px;">
            <div style="width: 40px; height: 40px; background: rgba(207,160,48,0.15); border-radius: 10px; display: flex; align-items: center; justify-content: center;">
                <span style="color: #CFA030; font-size: 20px;">✅</span>
            </div>
            <div>
                <p style="margin: 0; color: rgba(255,255,255,0.5); font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em;">GSLC NASHCO</p>
                <h2 style="margin: 2px 0 0; color: #ffffff; font-size: 16px; font-weight: 700;">
                    @if($lang === 'ar')تم تفعيل الحساب
                    @elseif($lang === 'en')Account activated
                    @else Votre compte a été activé
                    @endif
                </h2>
            </div>
        </div>

        {{-- Body --}}
        <div style="padding: 32px;">

            <p style="margin: 0 0 16px; color: #0D1F3C; font-size: 15px; font-weight: 600;">
                @if($lang === 'ar')مرحباً {{ $clientName }}،
                @elseif($lang === 'en')Hello {{ $clientName }},
                @else Bonjour {{ $clientName }},
                @endif
            </p>

            <p style="margin: 0 0 16px; color: #475569; font-size: 14px; line-height: 1.7;">
                @if($lang === 'ar')يسعدنا إخبارك بأنه تمت <strong style="color: #10B981;">الموافقة</strong> على طلب تسجيلك.
                @elseif($lang === 'en')We are pleased to inform you that your registration request has been <strong style="color: #10B981;">approved</strong>.
                @else Nous avons le plaisir de vous informer que votre demande d'inscription a été <strong style="color: #10B981;">approuvée</strong>.
                @endif
            </p>

            <p style="margin: 0 0 28px; color: #475569; font-size: 14px; line-height: 1.7;">
                @if($lang === 'ar')يمكنك الآن تسجيل الدخول إلى بوابة العملاء وتقديم طلبات الاستيراد.
                @elseif($lang === 'en')You can now log in to your client portal and submit your import requests.
                @else Vous pouvez maintenant vous connecter à votre portail client et soumettre vos demandes d'importation.
                @endif
            </p>

            <div style="text-align: center; margin-bottom: 28px;">
                <a href="{{ url('/login') }}"
                   style="display: inline-block; background: #CFA030; color: #0D1F3C; text-decoration: none; font-weight: 700; font-size: 14px; padding: 14px 32px; border-radius: 8px; letter-spacing: 0.02em;">
                    @if($lang === 'ar')الدخول إلى حسابي →
                    @elseif($lang === 'en')Access my account →
                    @else Accéder à mon espace →
                    @endif
                </a>
            </div>

            <p style="margin: 0; color: #64748b; font-size: 13px; line-height: 1.6;">
                @if($lang === 'ar')مع التحية،<br><strong>فريق NASHCO GSLC</strong>
                @elseif($lang === 'en')Best regards,<br><strong>The NASHCO GSLC Team</strong>
                @else Cordialement,<br><strong>L'équipe NASHCO</strong>
                @endif
            </p>
        </div>

        {{-- Footer --}}
        <div style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px 32px; text-align: center;">
            <p style="margin: 0; color: #94a3b8; font-size: 11px;">
                © {{ date('Y') }} EPE NASHCO Spa — Groupe GATMA &nbsp;|&nbsp; Cet email vous a été envoyé suite à l'activation de votre compte.
            </p>
        </div>
    </div>

</body>
</html>
