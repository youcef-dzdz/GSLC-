<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Traits\Auditable;
use App\Models\User;
use App\Models\Client;
use App\Models\JournalAudit;
use App\Models\ConfigurationSysteme;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class AdminController extends Controller
{
    use Auditable;

    // =========================================================================
    // DASHBOARD
    // =========================================================================

    public function dashboard(): JsonResponse
    {
        // Count users by role
        $usersByRole = User::with('role')
            ->get()
            ->groupBy(fn($u) => $u->role?->label ?? 'unknown')
            ->map->count();

        // Pending client registrations
        $pendingRegistrations = Client::where('statut', 'EN_ATTENTE_VALIDATION')->count();

        // Recent audit entries (last 10)
        $recentAudit = JournalAudit::with('utilisateur')
            ->orderByDesc('date_action')
            ->limit(10)
            ->get()
            ->map(fn($log) => [
                'id'            => $log->id,
                'action'        => $log->action,
                'table_cible'   => $log->table_cible,
                'utilisateur'   => $log->utilisateur
                                    ? $log->utilisateur->prenom . ' ' . $log->utilisateur->nom
                                    : 'Système',
                'adresse_ip'    => $log->adresse_ip,
                'resultat'      => $log->resultat,
                'date_action'   => $log->date_action,
            ]);

        // System health
        $systemHealth = [
            'total_users'    => User::count(),
            'active_users'   => User::where('statut', 'ACTIF')->count(),
            'suspended'      => User::where('statut', 'SUSPENDU')->count(),
            'pending_clients'=> $pendingRegistrations,
        ];

        return response()->json([
            'users_by_role'        => $usersByRole,
            'pending_registrations'=> $pendingRegistrations,
            'recent_audit'         => $recentAudit,
            'system_health'        => $systemHealth,
        ]);
    }

    // =========================================================================
    // REGISTRATIONS
    // =========================================================================

    /**
     * List all pending client registrations.
     * Admin reviews these and approves or rejects them.
     */
    public function registrations(Request $request): JsonResponse
    {
        $statut = $request->query('statut', 'EN_ATTENTE_VALIDATION');

        $registrations = Client::with(['user', 'pays'])
            ->where('statut', $statut)
            ->orderByDesc('created_at')
            ->paginate(20);

        return response()->json($registrations);
    }

    /**
     * Approve a client registration.
     * Sets user statut = ACTIF and client statut = VALIDE.
     */
    public function approveRegistration(int $id): JsonResponse
    {
        $client = Client::with('user')->findOrFail($id);

        if ($client->statut !== 'EN_ATTENTE_VALIDATION') {
            return response()->json([
                'message' => 'Cette inscription n\'est pas en attente de validation.',
            ], 422);
        }

        $oldClient = $client->toArray();

        // Activate the client profile
        $client->update([
            'statut'             => 'VALIDE',
            'valide_par_user_id' => Auth::id(),
            'date_validation'    => now(),
            'motif_rejet'        => null,
        ]);

        // Activate the user account
        $client->user->update(['statut' => 'ACTIF']);

        // Notify the client
        Notification::create([
            'destinataire_id' => $client->user_id,
            'titre'           => 'Compte activé',
            'message'         => 'Votre compte GSLC a été validé. Vous pouvez maintenant vous connecter et soumettre vos demandes.',
            'canal'           => 'EMAIL',
            'lu'              => false,
            'date_creation'   => now(),
        ]);

        $this->audit('UPDATE', 'clients', $client->id, $oldClient, $client->fresh()->toArray());

        return response()->json([
            'message' => 'Inscription approuvée. Le client peut maintenant se connecter.',
            'client'  => $client->fresh()->load('user'),
        ]);
    }

    /**
     * Reject a client registration with a reason.
     */
    public function rejectRegistration(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'motif' => 'required|string|max:500',
        ]);

        $client = Client::with('user')->findOrFail($id);

        if ($client->statut !== 'EN_ATTENTE_VALIDATION') {
            return response()->json([
                'message' => 'Cette inscription n\'est pas en attente de validation.',
            ], 422);
        }

        $oldClient = $client->toArray();

        $client->update([
            'statut'      => 'REJETE',
            'motif_rejet' => $request->motif,
        ]);

        $client->user->update(['statut' => 'REJETE']);

        // Notify the client
        Notification::create([
            'destinataire_id' => $client->user_id,
            'titre'           => 'Inscription rejetée',
            'message'         => 'Votre demande d\'inscription a été rejetée. Motif : ' . $request->motif,
            'canal'           => 'EMAIL',
            'lu'              => false,
            'date_creation'   => now(),
        ]);

        $this->audit('UPDATE', 'clients', $client->id, $oldClient, $client->fresh()->toArray());

        return response()->json([
            'message' => 'Inscription rejetée.',
            'client'  => $client->fresh()->load('user'),
        ]);
    }

    // =========================================================================
    // AUDIT LOG
    // =========================================================================

    /**
     * Paginated audit log with filters.
     * Filters: utilisateur_id, action, table_cible, date_debut, date_fin
     */
    public function auditLog(Request $request): JsonResponse
    {
        $query = JournalAudit::with('utilisateur')
            ->orderByDesc('date_action');

        // Filter by user
        if ($request->filled('utilisateur_id')) {
            $query->where('utilisateur_id', $request->utilisateur_id);
        }

        // Filter by action (LOGIN, CREATE, UPDATE, DELETE, LOGOUT)
        if ($request->filled('action')) {
            $query->where('action', $request->action);
        }

        // Filter by table
        if ($request->filled('table_cible')) {
            $query->where('table_cible', $request->table_cible);
        }

        // Filter by date range
        if ($request->filled('date_debut')) {
            $query->whereDate('date_action', '>=', $request->date_debut);
        }
        if ($request->filled('date_fin')) {
            $query->whereDate('date_action', '<=', $request->date_fin);
        }

        $logs = $query->paginate(50);

        // Format the response
        $logs->getCollection()->transform(fn($log) => [
            'id'               => $log->id,
            'utilisateur'      => $log->utilisateur
                                    ? $log->utilisateur->prenom . ' ' . $log->utilisateur->nom
                                    : 'Système',
            'action'           => $log->action,
            'table_cible'      => $log->table_cible,
            'enregistrement_id'=> $log->enregistrement_id,
            'anciennes_valeurs'=> $log->anciennes_valeurs,
            'nouvelles_valeurs'=> $log->nouvelles_valeurs,
            'adresse_ip'       => $log->adresse_ip,
            'resultat'         => $log->resultat,
            'date_action'      => $log->date_action,
        ]);

        return response()->json($logs);
    }

    // =========================================================================
    // SYSTEM CONFIGURATION
    // =========================================================================

    /**
     * Return all configuration values.
     */
    public function config(): JsonResponse
    {
        $config = ConfigurationSysteme::orderBy('cle')->get();

        return response()->json($config);
    }

    /**
     * Update a configuration value by its key.
     * Only modifiable=true configs can be changed.
     */
    public function updateConfig(Request $request): JsonResponse
    {
        $request->validate([
            'cle'    => 'required|string|exists:configuration_systeme,cle',
            'valeur' => 'required|string',
        ]);

        $config = ConfigurationSysteme::where('cle', $request->cle)->firstOrFail();

        if (! $config->modifiable) {
            return response()->json([
                'message' => 'Ce paramètre système ne peut pas être modifié.',
            ], 422);
        }

        $old = $config->toArray();
        $config->update(['valeur' => $request->valeur]);

        $this->audit('UPDATE', 'configuration_systeme', $config->id, $old, $config->fresh()->toArray());

        return response()->json([
            'message' => 'Configuration mise à jour avec succès.',
            'config'  => $config->fresh(),
        ]);
    }
}
