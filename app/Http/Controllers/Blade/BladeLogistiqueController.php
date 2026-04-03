<?php

namespace App\Http\Controllers\Blade;

use App\Http\Controllers\Controller;
use App\Models\Conteneur;
use App\Models\MouvementConteneur;
use App\Models\StatutConteneur;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class BladeLogistiqueController extends Controller
{
    // Allowed status transitions
    private array $transitions = [
        'DISPONIBLE'      => ['RESERVE', 'EN_MAINTENANCE'],
        'RESERVE'         => ['AU_PORT', 'DISPONIBLE'],
        'AU_PORT'         => ['AU_DEPOT', 'LIVRAISON_CLIENT'],
        'AU_DEPOT'        => ['LIVRAISON_CLIENT', 'DISPONIBLE', 'EN_MAINTENANCE'],
        'LIVRAISON_CLIENT'=> ['RETOURNE_VIDE'],
        'RETOURNE_VIDE'   => ['AU_DEPOT', 'EN_MAINTENANCE', 'DISPONIBLE'],
        'EN_MAINTENANCE'  => ['DISPONIBLE', 'AU_DEPOT'],
    ];

    public function dashboard()
    {
        $stats = [
            'total'        => Conteneur::count(),
            'disponible'   => Conteneur::where('statut', 'DISPONIBLE')->count(),
            'en_location'  => Conteneur::where('statut', 'LIVRAISON_CLIENT')->count(),
            'maintenance'  => Conteneur::where('statut', 'EN_MAINTENANCE')->count(),
        ];
        return view('blade.logistique.dashboard', compact('stats'));
    }

    public function containers()
    {
        $search = request('search');
        $statut = request('statut');
        $etat   = request('etat_actuel');

        $query = Conteneur::with('type:id,code_type,libelle')->orderBy('numero_conteneur');

        if ($search) {
            $query->where(fn($q) => $q
                ->where('numero_conteneur', 'ilike', "%{$search}%")
                ->orWhere('proprietaire', 'ilike', "%{$search}%")
            );
        }
        if ($statut) $query->where('statut', $statut);
        if ($etat)   $query->where('etat_actuel', $etat);

        $containers = $query->paginate(20)->withQueryString();
        return view('blade.logistique.containers.index', compact('containers', 'search'));
    }

    public function showContainer($id)
    {
        $container = Conteneur::with([
            'type',
            'statutHistorique' => fn($q) => $q->with('responsable:id,nom,prenom')->orderByDesc('date_changement')->limit(20),
        ])->findOrFail($id);

        $allowedTransitions = $this->transitions[$container->statut] ?? [];
        return view('blade.logistique.containers.show', compact('container', 'allowedTransitions'));
    }

    public function transitionStatus(Request $request, $id)
    {
        $request->validate([
            'new_statut'  => 'required|string',
            'commentaire' => 'nullable|string|max:500',
        ]);

        $container = Conteneur::findOrFail($id);
        $allowed   = $this->transitions[$container->statut] ?? [];

        if (!in_array($request->new_statut, $allowed)) {
            return back()->with('error', "Transition non autorisée : {$container->statut} → {$request->new_statut}");
        }

        DB::transaction(function () use ($container, $request) {
            $oldStatut = $container->statut;
            $container->update(['statut' => $request->new_statut]);

            StatutConteneur::create([
                'conteneur_id'    => $container->id,
                'ancien_statut'   => $oldStatut,
                'nouveau_statut'  => $request->new_statut,
                'responsable_id'  => auth()->id(),
                'commentaire'     => $request->commentaire,
                'date_changement' => now(),
            ]);
        });

        return back()->with('success', "Statut mis à jour : {$request->new_statut}");
    }

    public function movements()
    {
        $search      = request('search');
        $conteneurId = request('conteneur_id');
        $dateFrom    = request('date_from');
        $dateTo      = request('date_to');

        $query = MouvementConteneur::with([
            'conteneur:id,numero_conteneur',
            'client:id,raison_sociale',
        ])->orderByDesc('created_at');

        if ($search) {
            $query->whereHas('conteneur', fn($q) => $q->where('numero_conteneur', 'ilike', "%{$search}%"));
        }
        if ($conteneurId) $query->where('conteneur_id', $conteneurId);
        if ($dateFrom)    $query->whereDate('created_at', '>=', $dateFrom);
        if ($dateTo)      $query->whereDate('created_at', '<=', $dateTo);

        $movements = $query->paginate(20)->withQueryString();
        return view('blade.logistique.movements.index', compact('movements', 'search'));
    }

    public function warehouse()
    {
        $containers = Conteneur::with('type:id,code_type,libelle')
                               ->whereIn('statut', ['AU_DEPOT', 'DISPONIBLE'])
                               ->orderBy('numero_conteneur')
                               ->paginate(20)->withQueryString();
        return view('blade.logistique.warehouse', compact('containers'));
    }
}
