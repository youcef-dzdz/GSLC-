<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class BladeAuthenticate
{
    public function handle(Request $request, Closure $next)
    {
        if (!Auth::check()) {
            if (str_starts_with($request->path(), 'client')) {
                return redirect('/login')->with('error', 'Veuillez vous connecter pour accéder à votre espace.');
            }
            return redirect('/staff/login')->with('error', 'Accès réservé au personnel NASHCO.');
        }

        $user = Auth::user();

        if ($user->statut !== 'ACTIF') {
            Auth::logout();
            return redirect('/staff/login')->with('error', "Votre compte est suspendu ou inactif. Contactez l'administrateur.");
        }

        // Client trying to access /blade/*
        if (str_starts_with($request->path(), 'blade') && $user->role->label === 'client') {
            Auth::logout();
            return redirect('/login')->with('error', 'Accès réservé au personnel NASHCO.');
        }

        // Staff trying to access /client/*
        if (str_starts_with($request->path(), 'client') && $user->role->label !== 'client') {
            return redirect('/staff/login')->with('error', 'Accès réservé aux clients.');
        }

        return $next($request);
    }
}
