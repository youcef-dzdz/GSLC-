<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <title>Réinitialisation Mot de Passe — GSLC</title>
</head>
<body style="font-family: Arial, sans-serif; background: #f4f6fa; margin: 0; padding: 32px 0;">

    <div style="max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">

        {{-- Header --}}
        <div style="background: #0D1F3C; padding: 28px 32px; display: flex; align-items: center; gap: 12px;">
            <div style="width: 40px; height: 40px; background: rgba(207,160,48,0.15); border-radius: 10px; display: flex; align-items: center; justify-content: center;">
                <span style="color: #CFA030; font-size: 20px;">🔑</span>
            </div>
            <div>
                <p style="margin: 0; color: rgba(255,255,255,0.5); font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em;">Sécurité GSLC</p>
                <h2 style="margin: 2px 0 0; color: #ffffff; font-size: 16px; font-weight: 700;">Réinitialisation de mot de passe détectée</h2>
            </div>
        </div>

        {{-- Body --}}
        <div style="padding: 32px;">

            <p style="margin: 0 0 24px; color: #475569; font-size: 14px; line-height: 1.7;">
                Un membre du personnel a réinitialisé son mot de passe sur la plateforme GSLC NASHCO. Voici le détail de l'opération :
            </p>

            <table style="width: 100%; border-collapse: collapse; margin-bottom: 28px; font-size: 13px;">
                <tr style="background: #f8fafc;">
                    <td style="padding: 12px 16px; border: 1px solid #e2e8f0; font-weight: 700; color: #64748b; width: 160px; text-transform: uppercase; font-size: 11px; letter-spacing: 0.05em;">Nom complet</td>
                    <td style="padding: 12px 16px; border: 1px solid #e2e8f0; color: #0D1F3C; font-weight: 600;">{{ $staffUser->nom }} {{ $staffUser->prenom }}</td>
                </tr>
                <tr>
                    <td style="padding: 12px 16px; border: 1px solid #e2e8f0; font-weight: 700; color: #64748b; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em;">Rôle</td>
                    <td style="padding: 12px 16px; border: 1px solid #e2e8f0; color: #0D1F3C;">{{ $staffUser->role->nom_role }}</td>
                </tr>
                <tr style="background: #f8fafc;">
                    <td style="padding: 12px 16px; border: 1px solid #e2e8f0; font-weight: 700; color: #64748b; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em;">Email</td>
                    <td style="padding: 12px 16px; border: 1px solid #e2e8f0; color: #0D1F3C;">{{ $staffUser->email }}</td>
                </tr>
                <tr>
                    <td style="padding: 12px 16px; border: 1px solid #e2e8f0; font-weight: 700; color: #64748b; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em;">Date &amp; heure</td>
                    <td style="padding: 12px 16px; border: 1px solid #e2e8f0; color: #0D1F3C;">{{ $resetAt }}</td>
                </tr>
                <tr style="background: #f8fafc;">
                    <td style="padding: 12px 16px; border: 1px solid #e2e8f0; font-weight: 700; color: #64748b; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em;">Adresse IP</td>
                    <td style="padding: 12px 16px; border: 1px solid #e2e8f0; color: #0D1F3C; font-family: monospace;">{{ $ipAddress }}</td>
                </tr>
            </table>

            <p style="margin: 0 0 24px; color: #64748b; font-size: 13px; line-height: 1.6;">
                Si cette action n'a pas été autorisée, vérifiez immédiatement le compte concerné et bloquez-le si nécessaire.
            </p>

            <div style="text-align: center;">
                <a href="{{ url('/blade/admin/users') }}"
                   style="display: inline-block; background: #0D1F3C; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 13px; padding: 12px 28px; border-radius: 8px; letter-spacing: 0.02em;">
                    Gérer les utilisateurs →
                </a>
            </div>
        </div>

        {{-- Footer --}}
        <div style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px 32px; text-align: center;">
            <p style="margin: 0; color: #94a3b8; font-size: 11px;">
                © {{ date('Y') }} EPE NASHCO Spa — Groupe GATMA &nbsp;|&nbsp; Notification automatique de sécurité
            </p>
        </div>
    </div>

</body>
</html>
