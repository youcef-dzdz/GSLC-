<?php
namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Queue\SerializesModels;
use App\Models\ContactMessage;

class ContactMessageReceived extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public $contactMessage;
    public $objetLabel;

    public function __construct(ContactMessage $contactMessage)
    {
        $this->contactMessage = $contactMessage;

        // Human-readable labels for the email subject and body
        $labels = [
            'demande_location' => 'Demande de location de conteneurs',
            'demande_devis' => 'Demande de devis',
            'suivi_expedition' => "Suivi d'expédition",
            'information_services' => 'Information sur les services',
            'reclamation' => 'Réclamation',
            'autre' => 'Autre',
        ];

        // Ensure object is treated as string if it's cast as an enum
        $objetValue = $contactMessage->objet instanceof \BackedEnum 
                      ? $contactMessage->objet->value 
                      : $contactMessage->objet;
                      
        $this->objetLabel = $labels[$objetValue] ?? 'Autre';
    }

    public function envelope(): Envelope
    {
        // Recipients are managed by admin via system_config table
        // Keys: contact_email_admin, contact_email_commercial
        $adminEmail      = \App\Models\SystemConfig::where('key', 'contact_email_admin')->value('value');
        $commercialEmail = \App\Models\SystemConfig::where('key', 'contact_email_commercial')->value('value');

        $recipients = array_filter([$adminEmail, $commercialEmail]);

        // Fallback if both are empty — use mail.php default
        if (empty($recipients)) {
            $recipients = [config('mail.contact_receiver', 'contact@nashco.com.dz')];
        }

        return new Envelope(
            to: $recipients,
            subject: "[GSLC] Nouvelle demande — {$this->objetLabel} — {$this->contactMessage->nom_complet}",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.contact_message_received',
        );
    }
}
