<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class StaffPasswordResetAlert extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public User $staffUser;
    public string $ipAddress;
    public string $resetAt;

    public function __construct(User $staffUser, string $ipAddress)
    {
        $this->staffUser = $staffUser;
        $this->ipAddress = $ipAddress;
        $this->resetAt   = now()->format('d/m/Y à H:i:s');
    }

    public function envelope(): Envelope
    {
        $admin = User::whereHas('role', fn ($q) => $q->where('nom_role', 'Administrateur Système'))
                     ->where('statut', 'ACTIF')
                     ->first();

        $to = $admin?->email ?? config('mail.from.address');

        return new Envelope(
            to: $to,
            subject: sprintf(
                '[GSLC] Réinitialisation mot de passe — %s %s (%s) — %s',
                $this->staffUser->nom,
                $this->staffUser->prenom,
                $this->staffUser->role->nom_role,
                $this->resetAt
            ),
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.staff_password_reset_alert',
        );
    }
}
