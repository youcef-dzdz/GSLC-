<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Nouveau Message de Contact</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <h2>Nouveau message depuis la plateforme GSLC</h2>
    <p>Une nouvelle demande a été soumise via le formulaire de contact public.</p>
    
    <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
        <tr>
            <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; width: 150px; background-color: #f9f9f9;">Nom Complet:</td>
            <td style="padding: 10px; border: 1px solid #ddd;">{{ $contactMessage->nom_complet }}</td>
        </tr>
        <tr>
            <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; background-color: #f9f9f9;">Entreprise:</td>
            <td style="padding: 10px; border: 1px solid #ddd;">{{ $contactMessage->entreprise ?? 'Non renseigné' }}</td>
        </tr>
        <tr>
            <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; background-color: #f9f9f9;">E-mail:</td>
            <td style="padding: 10px; border: 1px solid #ddd;">{{ $contactMessage->email }}</td>
        </tr>
        <tr>
            <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; background-color: #f9f9f9;">Objet:</td>
            <td style="padding: 10px; border: 1px solid #ddd;">{{ $objetLabel }}</td>
        </tr>
        <tr>
            <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; background-color: #f9f9f9;">Date:</td>
            <td style="padding: 10px; border: 1px solid #ddd;">{{ $contactMessage->created_at->format('d/m/Y H:i:s') }}</td>
        </tr>
        <tr>
            <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; background-color: #f9f9f9;">Adresse IP:</td>
            <td style="padding: 10px; border: 1px solid #ddd;">{{ $contactMessage->ip_address }}</td>
        </tr>
    </table>

    <h3 style="margin-top: 30px;">Message:</h3>
    <div style="background-color: #f4f6fa; padding: 15px; border-radius: 5px; border-left: 4px solid #CFA030;">
        {!! nl2br(e($contactMessage->message)) !!}
    </div>
</body>
</html>
