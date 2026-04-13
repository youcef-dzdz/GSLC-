<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class StaffNewPassword extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public User $staffUser;
    public string $newPassword;
    public string $resetAt;
    public string $lang;

    public function __construct(User $staffUser, string $newPassword, string $lang = 'fr')
    {
        $this->staffUser   = $staffUser;
        $this->newPassword = $newPassword;
        $this->resetAt     = now()->format('d/m/Y à H:i:s');
        $this->lang        = $lang;
    }

    public function envelope(): Envelope
    {
        $subjects = [
            'fr' => '[GSLC] Votre nouveau mot de passe temporaire',
            'en' => '[GSLC] Your new temporary password',
            'ar' => '[GSLC] كلمة مرورك المؤقتة الجديدة',
        ];

        return new Envelope(
            to:      $this->staffUser->email,
            subject: $subjects[$this->lang] ?? $subjects['fr'],
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.staff_new_password',
        );
    }
}
