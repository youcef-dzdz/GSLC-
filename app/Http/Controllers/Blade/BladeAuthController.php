<?php

namespace App\Http\Controllers\Blade;

use App\Http\Controllers\Controller;
use App\Models\Client;
use App\Models\Pays;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class BladeAuthController extends Controller
{
    public function showStaffLogin()
    {
        return view('staff.login');
    }

    public function showClientLogin()
    {
        return view('auth.login');
    }

    public function showRegister()
    {
        $pays = Pays::orderBy('nom_pays')->get(['id', 'nom_pays']);
        return view('auth.register', compact('pays'));
    }

    public function staffLogin(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required',
        ]);

        $user = User::with('role')->where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return back()->with('error', 'Identifiants incorrects.');
        }

        if ($user->role->label === 'client') {
            return back()->with('error', 'Accès réservé au personnel. Utilisez le portail client : /login');
        }

        switch ($user->statut) {
            case 'EN_ATTENTE_VALIDATION':
                return back()->with('error', 'Votre compte est en attente de validation.');
            case 'SUSPENDU':
                return back()->with('error', "Votre compte est suspendu. Contactez l'administrateur.");
            case 'REJETE':
                return back()->with('error', 'Accès refusé.');
        }

        Auth::login($user);
        $request->session()->regenerate();

        $destination = match ($user->role->label) {
            'admin'      => '/blade/admin/dashboard',
            'directeur'  => '/blade/direction/dashboard',
            'commercial' => '/blade/commercial/dashboard',
            'logistique' => '/blade/logistique/dashboard',
            'financier'  => '/blade/finance/dashboard',
            default      => '/blade/admin/dashboard',
        };

        return redirect($destination);
    }

    public function clientLogin(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required',
        ]);

        $user = User::with('role')->where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return back()->with('error', 'Identifiants incorrects.');
        }

        if ($user->role->label !== 'client') {
            return back()->with('error', 'Utilisez le portail personnel : /staff/login');
        }

        switch ($user->statut) {
            case 'SUSPENDU':
                return back()->with('error', 'Votre compte est suspendu. Contactez le support.');
            case 'REJETE':
                return back()->with('error', 'Accès refusé.');
        }

        $client = Client::where('user_id', $user->id)->first();

        if (!$client) {
            return back()->with('error', 'Profil client introuvable. Contactez le support.');
        }

        switch ($client->statut) {
            case 'EN_ATTENTE_VALIDATION':
                return back()->with('error', 'Votre demande est en cours de validation (24-48h ouvrables).');
            case 'REJETE':
                $motif = $client->motif_rejet ? " Motif : {$client->motif_rejet}" : '';
                return back()->with('error', "Votre demande a été rejetée.{$motif}");
            case 'SUSPENDU':
                return back()->with('error', 'Votre compte a été suspendu. Contactez le support.');
        }

        Auth::login($user);
        $request->session()->regenerate();

        return redirect('/client/dashboard');
    }

    public function register(Request $request)
    {
        $request->validate([
            'raison_sociale' => 'required|string|max:200',
            'nif'            => 'required|string|max:20|unique:clients,nif',
            'nis'            => 'required|string|max:20|unique:clients,nis',
            'rc'             => 'required|string|max:50|unique:clients,rc',
            'adresse_siege'  => 'required|string|max:255',
            'ville'          => 'required|string|max:100',
            'pays_id'        => 'required|exists:pays,id',
            'type_client'    => 'required|in:ORDINAIRE,EN_PNUE,EXPORTATEUR',
            'rep_nom'        => 'required|string|max:100',
            'rep_prenom'     => 'required|string|max:100',
            'rep_role'       => 'required|string|max:100',
            'rep_tel'        => 'required|string|max:20',
            'rep_email'      => 'required|email|max:150|unique:users,email',
            'password'       => 'required|string|min:8|confirmed',
        ]);

        DB::transaction(function () use ($request) {
            $clientRole = Role::where('label', 'client')->firstOrFail();

            $user = User::create([
                'nom'      => $request->rep_nom,
                'prenom'   => $request->rep_prenom,
                'email'    => $request->rep_email,
                'password' => Hash::make($request->password),
                'role_id'  => $clientRole->id,
                'statut'   => 'EN_ATTENTE_VALIDATION',
            ]);

            Client::create([
                'user_id'        => $user->id,
                'raison_sociale' => $request->raison_sociale,
                'nif'            => $request->nif,
                'nis'            => $request->nis,
                'rc'             => $request->rc,
                'adresse_siege'  => $request->adresse_siege,
                'ville'          => $request->ville,
                'pays_id'        => $request->pays_id,
                'type_client'    => $request->type_client,
                'rep_nom'        => $request->rep_nom,
                'rep_prenom'     => $request->rep_prenom,
                'rep_role'       => $request->rep_role,
                'rep_tel'        => $request->rep_tel,
                'rep_email'      => $request->rep_email,
                'statut'         => 'EN_ATTENTE_VALIDATION',
            ]);
        });

        return redirect('/login')->with('success', 'Demande soumise. Notre équipe la validera sous 24-48h ouvrables.');
    }

    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return redirect('/');
    }

    public function setLanguage(Request $request)
    {
        $request->validate(['lang' => 'required|in:fr,en,ar']);
        session(['gslc_lang' => $request->lang]);
        return back();
    }
}
