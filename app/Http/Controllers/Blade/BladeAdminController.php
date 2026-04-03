<?php

namespace App\Http\Controllers\Blade;

use App\Http\Controllers\Controller;
use App\Models\Client;
use App\Models\JournalAudit;
use App\Models\Role;
use App\Models\User;
use App\Models\UserPermission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class BladeAdminController extends Controller
{
    public function dashboard()
    {
        $stats = [
            'users'         => User::count(),
            'clients'       => Client::count(),
            'pending'       => Client::where('statut', 'EN_ATTENTE_VALIDATION')->count(),
            'active_clients'=> Client::where('statut', 'APPROUVE')->count(),
        ];
        return view('blade.admin.dashboard', compact('stats'));
    }

    public function users()
    {
        $search = request('search');
        $role   = request('role');
        $statut = request('statut');

        $query = User::with('role')->orderBy('nom');

        if ($search) {
            $query->where(fn($q) => $q
                ->where('nom', 'ilike', "%{$search}%")
                ->orWhere('prenom', 'ilike', "%{$search}%")
                ->orWhere('email', 'ilike', "%{$search}%")
            );
        }
        if ($role)   $query->whereHas('role', fn($q) => $q->where('label', $role));
        if ($statut) $query->where('statut', $statut);

        $users = $query->paginate(20)->withQueryString();
        $roles = Role::orderBy('niveau')->get();

        return view('blade.admin.users.index', compact('users', 'roles', 'search'));
    }

    public function createUser()
    {
        $roles = Role::where('label', '!=', 'client')->orderBy('niveau')->get();
        return view('blade.admin.users.form', compact('roles'));
    }

    public function storeUser(Request $request)
    {
        $validated = $request->validate([
            'nom'      => 'required|string|max:100',
            'prenom'   => 'required|string|max:100',
            'email'    => 'required|email|max:150|unique:users,email',
            'password' => 'required|string|min:8',
            'role_id'  => 'required|exists:roles,id',
            'position' => 'required|string|max:100',
            'statut'   => 'required|in:ACTIF,SUSPENDU',
        ]);

        $validated['password'] = Hash::make($validated['password']);
        User::create($validated);

        return redirect(route('blade.admin.users'))->with('success', 'Utilisateur créé avec succès.');
    }

    public function editUser($id)
    {
        $user  = User::findOrFail($id);
        $roles = Role::where('label', '!=', 'client')->orderBy('niveau')->get();
        return view('blade.admin.users.form', compact('user', 'roles'));
    }

    public function updateUser(Request $request, $id)
    {
        $user = User::findOrFail($id);
        $validated = $request->validate([
            'nom'      => 'required|string|max:100',
            'prenom'   => 'required|string|max:100',
            'email'    => "required|email|max:150|unique:users,email,{$id}",
            'role_id'  => 'required|exists:roles,id',
            'position' => 'required|string|max:100',
            'statut'   => 'required|in:ACTIF,SUSPENDU,EN_ATTENTE_VALIDATION,REJETE',
        ]);

        if ($request->filled('password')) {
            $request->validate(['password' => 'string|min:8']);
            $validated['password'] = Hash::make($request->password);
        }

        $user->update($validated);
        return redirect(route('blade.admin.users'))->with('success', 'Utilisateur modifié.');
    }

    public function blockUser(Request $request, $id)
    {
        $user = User::findOrFail($id);
        $user->update(['statut' => $user->statut === 'ACTIF' ? 'SUSPENDU' : 'ACTIF']);
        $action = $user->statut === 'ACTIF' ? 'réactivé' : 'suspendu';
        return back()->with('success', "Utilisateur {$action}.");
    }

    public function permissions($id)
    {
        $user = User::with(['role', 'userPermissions'])->findOrFail($id);

        if ($user->isResponsable()) {
            return back()->with('error', 'Les responsables ont accès complet à leur service. Les permissions ne s\'appliquent qu\'aux agents.');
        }

        $allPermissions  = config('gslc_permissions');
        $userPermissions = $user->userPermissions->keyBy('permission');

        return view('blade.admin.users.permissions', compact('user', 'allPermissions', 'userPermissions'));
    }

    public function savePermissions(Request $request, $id)
    {
        $user = User::findOrFail($id);

        if ($user->isResponsable()) {
            abort(403);
        }

        $submitted = $request->input('permissions', []);
        $allFlat   = [];

        foreach (config('gslc_permissions') as $resource => $actions) {
            foreach ($actions as $action) {
                $allFlat[] = "{$resource}.{$action}";
            }
        }

        $toSync = [];
        foreach ($allFlat as $perm) {
            $toSync[$perm] = isset($submitted[$perm]);
        }

        $user->syncPermissions($toSync);

        return back()->with('success', 'Permissions enregistrées.');
    }

    public function registrations()
    {
        $search = request('search');
        $query  = Client::with(['user', 'pays'])
                        ->where('statut', 'EN_ATTENTE_VALIDATION')
                        ->orderByDesc('created_at');

        if ($search) {
            $query->where(fn($q) => $q
                ->where('raison_sociale', 'ilike', "%{$search}%")
                ->orWhere('nif', 'ilike', "%{$search}%")
                ->orWhere('rep_email', 'ilike', "%{$search}%")
            );
        }

        $clients = $query->paginate(20)->withQueryString();
        return view('blade.admin.registrations', compact('clients', 'search'));
    }

    public function approveRegistration(Request $request, $id)
    {
        $client = Client::findOrFail($id);
        DB::transaction(function () use ($client) {
            $client->update([
                'statut'              => 'APPROUVE',
                'valide_par_user_id'  => auth()->id(),
                'date_validation'     => now(),
            ]);
            $client->user->update(['statut' => 'ACTIF']);
        });
        return back()->with('success', "Inscription de {$client->raison_sociale} approuvée.");
    }

    public function rejectRegistration(Request $request, $id)
    {
        $request->validate(['motif_rejet' => 'required|string|max:500']);
        $client = Client::findOrFail($id);
        DB::transaction(function () use ($client, $request) {
            $client->update([
                'statut'      => 'REJETE',
                'motif_rejet' => $request->motif_rejet,
            ]);
            $client->user->update(['statut' => 'REJETE']);
        });
        return back()->with('success', "Inscription rejetée.");
    }

    public function audit()
    {
        $search    = request('search');
        $action    = request('action');
        $table     = request('table_name');
        $dateFrom  = request('date_from');
        $dateTo    = request('date_to');

        $query = JournalAudit::with('user')->orderByDesc('created_at');

        if ($search)   $query->where(fn($q) => $q->where('description', 'ilike', "%{$search}%")->orWhere('table_name', 'ilike', "%{$search}%"));
        if ($action)   $query->where('action', $action);
        if ($table)    $query->where('table_name', $table);
        if ($dateFrom) $query->whereDate('created_at', '>=', $dateFrom);
        if ($dateTo)   $query->whereDate('created_at', '<=', $dateTo);

        $logs   = $query->paginate(50)->withQueryString();
        $tables = JournalAudit::distinct()->orderBy('table_name')->pluck('table_name');

        return view('blade.admin.audit', compact('logs', 'tables', 'action', 'table', 'dateFrom', 'dateTo', 'search'));
    }

    public function config()
    {
        return view('blade.wip', ['page' => 'Configuration système — En construction']);
    }
}
