<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ClientRegistrationApproved extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public string $clientName;
    public string $clientEmail;
    public string $lang;

    public function __construct(string $clientName, string $clientEmail, string $lang = 'fr')
    {
        $this->clientName  = $clientName;
        $this->clientEmail = $clientEmail;
        $this->lang        = $lang;
    }

    public function envelope(): Envelope
    {
        $subjects = [
            'fr' => 'Votre compte GSLC a été activé',
            'en' => 'Your GSLC account has been activated',
            'ar' => 'تم تفعيل حسابك على GSLC',
        ];

        return new Envelope(
            to:      $this->clientEmail,
            subject: $subjects[$this->lang] ?? $subjects['fr'],
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.client_approved',
        );
    }
}
