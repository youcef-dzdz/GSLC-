<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class SuspiciousLoginAlert extends Mailable
{
    use Queueable, SerializesModels;

    public $ip;
    public $attempts;
    public $attemptedEmail;

    /**
     * Create a new message instance.
     */
    public function __construct(string $ip, int $attempts, string $attemptedEmail)
    {
        $this->ip = $ip;
        $this->attempts = $attempts;
        $this->attemptedEmail = $attemptedEmail;
    }

    /**
     * Build the message.
     */
    public function build()
    {
        return $this->subject("[GSLC] Activité suspecte détectée — {$this->attempts} tentatives depuis {$this->ip}")
                    ->withSymfonyMessage(function ($message) {
                        $message->text("Alerte sécurité NASHCO\n\nIP: {$this->ip}\nEmail ciblé: {$this->attemptedEmail}\nTentatives: {$this->attempts}\nHeure: " . now()->format('d/m/Y H:i:s') . "\n\nCette IP a été automatiquement bloquée pendant 15 minutes.");
                    });
    }
}
