<?php

namespace App\Http\Middleware;

use App\Models\Client;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ClientPortalAccess
{
    public function handle(Request $request, Closure $next)
    {
        $user = Auth::user();

        if ($user->role->label !== 'client') {
            return redirect('/staff/login')->with('error', 'Accès réservé aux clients.');
        }

        $client = Client::where('user_id', $user->id)->first();

        if (!$client) {
            Auth::logout();
            return redirect('/login')->with('error', 'Profil client introuvable. Contactez le support.');
        }

        if ($client->statut !== 'APPROUVE') {
            Auth::logout();
            $message = match ($client->statut) {
                'EN_ATTENTE_VALIDATION' => 'Votre compte est en attente de validation par notre équipe.',
                'REJETE'   => "Votre demande a été rejetée. Motif : {$client->motif_rejet}",
                'SUSPENDU' => 'Votre compte a été suspendu. Contactez le support.',
                default    => 'Accès refusé.',
            };
            return redirect('/login')->with('error', $message);
        }

        return $next($request);
    }
}
