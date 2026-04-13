<!DOCTYPE html>
<html lang="{{ $lang }}" dir="{{ $lang === 'ar' ? 'rtl' : 'ltr' }}">
<head>
    <meta charset="utf-8">
    <title>
        @if($lang === 'ar')لم يتم قبول الطلب — GSLC NASHCO
        @elseif($lang === 'en')Application not accepted — GSLC NASHCO
        @else Demande d'inscription — GSLC NASHCO
        @endif
    </title>
</head>
<body style="font-family: Arial, sans-serif; background: #f4f6fa; margin: 0; padding: 32px 0;">

    <div style="max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">

        {{-- Header --}}
        <div style="background: #0D1F3C; padding: 28px 32px; display: flex; align-items: center; gap: 12px;">
            <div style="width: 40px; height: 40px; background: rgba(239,68,68,0.15); border-radius: 10px; display: flex; align-items: center; justify-content: center;">
                <span style="color: #EF4444; font-size: 20px;">ℹ️</span>
            </div>
            <div>
                <p style="margin: 0; color: rgba(255,255,255,0.5); font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em;">GSLC NASHCO</p>
                <h2 style="margin: 2px 0 0; color: #ffffff; font-size: 16px; font-weight: 700;">
                    @if($lang === 'ar')لم يتم قبول الطلب
                    @elseif($lang === 'en')Application not accepted
                    @else Demande non retenue
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
                @if($lang === 'ar')بعد دراسة ملفك، نُعلمك بأنه لم نتمكن من قبول طلب تسجيلك.
                @elseif($lang === 'en')After reviewing your file, we inform you that your registration request could not be accepted.
                @else Après examen de votre dossier, nous vous informons que votre demande d'inscription n'a pas pu être acceptée.
                @endif
            </p>

            <div style="background: #FFF7ED; border-left: 4px solid #F97316; border-radius: 0 8px 8px 0; padding: 16px 20px; margin-bottom: 24px;">
                <p style="margin: 0 0 6px; color: #92400E; font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 700;">
                    @if($lang === 'ar')السبب: @elseif($lang === 'en')Reason: @else Motif @endif
                </p>
                <p style="margin: 0; color: #7C2D12; font-size: 14px; line-height: 1.6;">{{ $motif }}</p>
            </div>

            <p style="margin: 0 0 24px; color: #475569; font-size: 14px; line-height: 1.7;">
                @if($lang === 'ar')لأي استفسار أو لتقديم ملف جديد، لا تتردد في التواصل معنا.
                @elseif($lang === 'en')For any questions or to submit a new application, please do not hesitate to contact us.
                @else Pour toute question ou pour soumettre un nouveau dossier, n'hésitez pas à nous contacter.
                @endif
            </p>

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
                © {{ date('Y') }} EPE NASHCO Spa — Groupe GATMA &nbsp;|&nbsp; Cet email vous a été envoyé suite au traitement de votre demande.
            </p>
        </div>
    </div>

</body>
</html>
