<?php

namespace App\Http\Controllers\Blade;

use App\Http\Controllers\Controller;
use App\Models\Client;
use App\Models\ContratImport;
use App\Models\DemandeImport;
use App\Models\Devis;
use App\Models\Navire;
use App\Models\Notification;
use App\Models\Pays;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class BladeCommercialController extends Controller
{
    public function dashboard()
    {
        $stats = [
            'clients'   => Client::where('statut', 'APPROUVE')->count(),
            'demandes'  => DemandeImport::whereIn('statut', ['SOUMISE', 'EN_COURS'])->count(),
            'devis'     => Devis::whereIn('statut', ['ENVOYE', 'EN_NEGOCIATION'])->count(),
            'contrats'  => ContratImport::where('statut', 'ACTIF')->count(),
        ];
        return view('blade.commercial.dashboard', compact('stats'));
    }

    // ── CLIENTS ──────────────────────────────────────────────────

    public function clients()
    {
        $search = request('search');
        $statut = request('statut');
        $type   = request('type_client');

        $query = Client::with(['user:id,nom,prenom,email,statut', 'pays:id,nom_pays'])
                       ->orderByDesc('created_at');

        if ($search) {
            $query->where(fn($q) => $q
                ->where('raison_sociale', 'ilike', "%{$search}%")
                ->orWhere('nif', 'ilike', "%{$search}%")
                ->orWhere('ville', 'ilike', "%{$search}%")
                ->orWhere('rep_email', 'ilike', "%{$search}%")
            );
        }
        if ($statut) $query->where('statut', $statut);
        if ($type)   $query->where('type_client', $type);

        $clients = $query->paginate(20)->withQueryString();
        return view('blade.commercial.clients.index', compact('clients', 'search'));
    }

    public function createClient()
    {
        $pays = Pays::orderBy('nom_pays')->get(['id', 'nom_pays']);
        return view('blade.commercial.clients.form', compact('pays'));
    }

    public function storeClient(Request $request)
    {
        $validated = $request->validate([
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
        ]);

        DB::transaction(function () use ($validated) {
            $clientRole   = Role::where('label', 'client')->firstOrFail();
            $tempPassword = Str::random(12);

            $user = User::create([
                'nom'      => $validated['rep_nom'],
                'prenom'   => $validated['rep_prenom'],
                'email'    => $validated['rep_email'],
                'password' => Hash::make($tempPassword),
                'role_id'  => $clientRole->id,
                'statut'   => 'ACTIF',
            ]);

            Client::create(array_merge($validated, [
                'user_id'             => $user->id,
                'statut'              => 'APPROUVE',
                'valide_par_user_id'  => auth()->id(),
                'date_validation'     => now(),
            ]));

            Notification::create([
                'destinataire_id' => $user->id,
                'titre'           => 'Compte GSLC créé',
                'message'         => "Email: {$user->email} | Mot de passe temporaire: {$tempPassword}",
                'canal'           => 'EMAIL',
                'lu'              => false,
                'date_creation'   => now(),
            ]);
        });

        return redirect(route('blade.commercial.clients'))->with('success', 'Client créé avec succès.');
    }

    public function showClient($id)
    {
        $client = Client::with([
            'user', 'pays', 'validePar',
            'demandes' => fn($q) => $q->latest()->limit(5),
            'contrats', 'factures',
        ])->findOrFail($id);

        $stats = [
            'contrats'      => $client->contrats()->count(),
            'facture_total' => $client->factures()->sum('montant_ttc'),
            'facture_paye'  => $client->factures()->sum('montant_paye'),
            'solde'         => $client->factures()->sum('montant_restant'),
        ];

        return view('blade.commercial.clients.show', compact('client', 'stats'));
    }

    public function editClient($id)
    {
        $client = Client::findOrFail($id);
        $pays   = Pays::orderBy('nom_pays')->get(['id', 'nom_pays']);
        return view('blade.commercial.clients.form', compact('client', 'pays'));
    }

    public function updateClient(Request $request, $id)
    {
        $client    = Client::findOrFail($id);
        $validated = $request->validate([
            'raison_sociale' => 'required|string|max:200',
            'nif'            => "required|string|max:20|unique:clients,nif,{$id}",
            'nis'            => "required|string|max:20|unique:clients,nis,{$id}",
            'rc'             => "required|string|max:50|unique:clients,rc,{$id}",
            'adresse_siege'  => 'required|string|max:255',
            'ville'          => 'required|string|max:100',
            'pays_id'        => 'required|exists:pays,id',
            'type_client'    => 'required|in:ORDINAIRE,EN_PNUE,EXPORTATEUR',
            'rep_nom'        => 'required|string|max:100',
            'rep_prenom'     => 'required|string|max:100',
            'rep_role'       => 'required|string|max:100',
            'rep_tel'        => 'required|string|max:20',
        ]);

        $client->update($validated);
        return redirect(route('blade.commercial.clients.show', $id))->with('success', 'Client modifié avec succès.');
    }

    public function destroyClient($id)
    {
        $client = Client::findOrFail($id);

        if ($client->demandes()->exists()) {
            return back()->with('error', 'Impossible de supprimer : des demandes sont liées à ce client.');
        }
        if ($client->contrats()->exists()) {
            return back()->with('error', 'Impossible de supprimer : des contrats sont liés à ce client.');
        }
        if ($client->factures()->exists()) {
            return back()->with('error', 'Impossible de supprimer : des factures sont liées à ce client.');
        }

        DB::transaction(function () use ($client) {
            $userId = $client->user_id;
            $client->delete();
            User::destroy($userId);
        });

        return redirect(route('blade.commercial.clients'))->with('success', 'Client supprimé.');
    }

    // ── DEMANDES ──────────────────────────────────────────────────

    public function demands()
    {
        $search   = request('search');
        $statut   = request('statut');
        $priorite = request('priorite');

        $query = DemandeImport::with(['client:id,raison_sociale', 'traitePar:id,nom,prenom'])
                              ->orderByDesc('date_soumission');

        if ($search) {
            $query->where(fn($q) => $q
                ->where('numero_dossier', 'ilike', "%{$search}%")
                ->orWhereHas('client', fn($c) => $c->where('raison_sociale', 'ilike', "%{$search}%"))
            );
        }
        if ($statut)   $query->where('statut', $statut);
        if ($priorite) $query->where('priorite', $priorite);

        $demands = $query->paginate(20)->withQueryString();
        return view('blade.commercial.demands.index', compact('demands', 'search'));
    }

    public function showDemand($id)
    {
        $demand = DemandeImport::with([
            'client', 'traitePar', 'portOrigine', 'portDestination',
            'lignes.typeConteneur', 'devis',
        ])->findOrFail($id);

        return view('blade.commercial.demands.show', compact('demand'));
    }

    // ── DEVIS ──────────────────────────────────────────────────

    public function quotes()
    {
        $search = request('search');
        $statut = request('statut');

        $query = Devis::with(['demande.client:id,raison_sociale', 'creePar:id,nom,prenom'])
                      ->orderByDesc('created_at');

        if ($search) {
            $query->where(fn($q) => $q
                ->where('numero_devis', 'ilike', "%{$search}%")
                ->orWhereHas('demande.client', fn($c) => $c->where('raison_sociale', 'ilike', "%{$search}%"))
            );
        }
        if ($statut) $query->where('statut', $statut);

        $quotes = $query->paginate(20)->withQueryString();
        return view('blade.commercial.quotes.index', compact('quotes', 'search'));
    }

    public function createQuote()
    {
        $demands = DemandeImport::with('client:id,raison_sociale')
                                ->whereIn('statut', ['SOUMISE', 'EN_COURS'])
                                ->orderByDesc('date_soumission')
                                ->get();
        return view('blade.commercial.quotes.form', compact('demands'));
    }

    public function storeQuote(Request $request)
    {
        $request->validate([
            'demande_id'  => 'required|exists:demandes_import,id',
            'montant_ht'  => 'required|numeric|min:0',
            'tva'         => 'required|numeric|min:0',
            'total_ttc'   => 'required|numeric|min:0',
            'date_expiration' => 'nullable|date|after:today',
            'commentaire_nashco' => 'nullable|string|max:1000',
        ]);

        $devis = Devis::create([
            'demande_id'          => $request->demande_id,
            'cree_par_user_id'    => auth()->id(),
            'numero_devis'        => 'DEV-' . date('Y') . '-' . str_pad(Devis::count() + 1, 4, '0', STR_PAD_LEFT),
            'montant_ht'          => $request->montant_ht,
            'tva'                 => $request->tva,
            'total_ttc'           => $request->total_ttc,
            'date_expiration'     => $request->date_expiration,
            'commentaire_nashco'  => $request->commentaire_nashco,
            'statut'              => 'BROUILLON',
        ]);

        return redirect(route('blade.commercial.quotes.show', $devis->id))->with('success', 'Devis créé.');
    }

    public function showQuote($id)
    {
        $quote = Devis::with(['demande.client', 'creePar', 'lignes'])->findOrFail($id);
        return view('blade.commercial.quotes.show', compact('quote'));
    }

    // ── CONTRATS ──────────────────────────────────────────────────

    public function contracts()
    {
        $search = request('search');
        $statut = request('statut');

        $query = ContratImport::with(['client:id,raison_sociale', 'creePar:id,nom,prenom'])
                              ->orderByDesc('created_at');

        if ($search) {
            $query->where(fn($q) => $q
                ->where('numero_contrat', 'ilike', "%{$search}%")
                ->orWhereHas('client', fn($c) => $c->where('raison_sociale', 'ilike', "%{$search}%"))
            );
        }
        if ($statut) $query->where('statut', $statut);

        $contracts = $query->paginate(20)->withQueryString();
        return view('blade.commercial.contracts.index', compact('contracts', 'search'));
    }

    public function showContract($id)
    {
        $contract = ContratImport::with([
            'client', 'devis', 'demande', 'creePar', 'lignes.typeConteneur',
        ])->findOrFail($id);

        return view('blade.commercial.contracts.show', compact('contract'));
    }

    // ── NAVIRES ──────────────────────────────────────────────────

    public function vessels()
    {
        $search = request('search');
        $actif  = request('actif');

        $query = Navire::with('pays:id,nom_pays')->orderBy('nom_navire');

        if ($search) {
            $query->where(fn($q) => $q
                ->where('nom_navire', 'ilike', "%{$search}%")
                ->orWhere('numero_imo', 'ilike', "%{$search}%")
                ->orWhere('compagnie_maritime', 'ilike', "%{$search}%")
            );
        }
        if ($actif !== null && $actif !== '') {
            $query->where('actif', (bool) $actif);
        }

        $vessels = $query->paginate(20)->withQueryString();
        return view('blade.commercial.vessels.index', compact('vessels', 'search'));
    }

    public function createVessel()
    {
        $pays = Pays::orderBy('nom_pays')->get(['id', 'nom_pays']);
        return view('blade.commercial.vessels.form', compact('pays'));
    }

    public function storeVessel(Request $request)
    {
        $validated = $request->validate([
            'nom_navire'         => 'required|string|max:150',
            'numero_imo'         => 'required|string|max:20|unique:navires,numero_imo',
            'pays_id'            => 'nullable|exists:pays,id',
            'compagnie_maritime' => 'nullable|string|max:150',
            'capacite_teu'       => 'required|integer|min:1',
            'annee_construction' => 'nullable|integer|min:1900|max:' . date('Y'),
            'actif'              => 'boolean',
        ]);

        $validated['actif'] = $request->has('actif');
        Navire::create($validated);

        return redirect(route('blade.commercial.vessels'))->with('success', 'Navire ajouté.');
    }

    public function editVessel($id)
    {
        $vessel = Navire::findOrFail($id);
        $pays   = Pays::orderBy('nom_pays')->get(['id', 'nom_pays']);
        return view('blade.commercial.vessels.form', compact('vessel', 'pays'));
    }

    public function updateVessel(Request $request, $id)
    {
        $vessel    = Navire::findOrFail($id);
        $validated = $request->validate([
            'nom_navire'         => 'required|string|max:150',
            'numero_imo'         => "required|string|max:20|unique:navires,numero_imo,{$id}",
            'pays_id'            => 'nullable|exists:pays,id',
            'compagnie_maritime' => 'nullable|string|max:150',
            'capacite_teu'       => 'required|integer|min:1',
            'annee_construction' => 'nullable|integer|min:1900|max:' . date('Y'),
        ]);

        $validated['actif'] = $request->has('actif');
        $vessel->update($validated);

        return redirect(route('blade.commercial.vessels'))->with('success', 'Navire modifié.');
    }

    public function destroyVessel($id)
    {
        $vessel = Navire::findOrFail($id);
        $vessel->delete();
        return redirect(route('blade.commercial.vessels'))->with('success', 'Navire supprimé.');
    }
}
