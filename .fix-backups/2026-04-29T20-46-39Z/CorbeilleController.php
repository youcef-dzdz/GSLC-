<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\Corbeille;

class CorbeilleController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = auth()->user();
        $niveau = $user->role->niveau ?? 99;
        
        if ($niveau > 3) {
            return response()->json(['message' => 'Accès refusé'], 403);
        }

        $query = Corbeille::whereNull('restored_at')
            ->orderByDesc('deleted_at_audit');

        if ($request->filled('module')) {
            $query->where('model_type', 'like', '%' . $request->module . '%');
        }

        $items = $query->get()->map(function ($item) {
            return [
                'id' => $item->id,
                'model_type' => $item->model_type,
                'model_id' => $item->model_id,
                'snapshot' => $item->snapshot,
                'deleted_by' => $item->deleted_by,
                'deleted_by_name' => $item->deleted_by_name,
                'deleted_by_email' => $item->deleted_by_email,
                'deleted_by_role' => $item->deleted_by_role,
                'deleted_by_ip' => $item->deleted_by_ip,
                'deleted_at_audit' => $item->deleted_at_audit,
                'expires_at' => $item->expires_at,
                'restored_at' => $item->restored_at,
                'restored_by_name' => $item->restored_by_name,
                'restored_by_ip' => $item->restored_by_ip,
                'is_expired' => $item->expires_at <= now()
            ];
        });

        return response()->json([
            'data' => $items
        ]);
    }

    public function restore(Request $request, int $id): JsonResponse
    {
        $user = auth()->user();
        $niveau = $user->role->niveau ?? 99;

        if ($niveau > 3) {
            return response()->json(['message' => 'Accès refusé'], 403);
        }

        $corbeille = Corbeille::find($id);

        if (!$corbeille) {
            return response()->json(['message' => 'Non trouvé'], 404);
        }

        if ($corbeille->expires_at <= now()) {
            return response()->json(['message' => 'Enregistrement expiré'], 422);
        }

        if ($corbeille->restored_at !== null) {
            return response()->json(['message' => 'Déjà restauré'], 422);
        }

        $modelClass = $corbeille->model_type;

        try {
            if (method_exists($modelClass, 'restoreFromCorbeille')) {
                $modelClass::restoreFromCorbeille($corbeille->id, $user->id, $request->ip());
            }
        } catch (\Exception $e) {
            return response()->json(['message' => 'Erreur lors de la restauration : ' . $e->getMessage()], 422);
        }

        // Determine if Auditable trait or JournalAudit exists to push telemetry
        if (class_exists(\App\Models\JournalAudit::class)) {
            try {
                \App\Models\JournalAudit::create([
                    'utilisateur_id'    => $user->id,
                    'action'            => 'RESTORE',
                    'table_cible'       => $corbeille->model_type,
                    'enregistrement_id' => $corbeille->model_id,
                    'nouvelles_valeurs' => ['corbeille_id' => $corbeille->id],
                    'adresse_ip'        => $request->ip(),
                    'resultat'          => 'success',
                    'date_action'       => now(),
                ]);
            } catch (\Exception $e) {
                // silent fallback — audit failure must not block restore
            }
        }

        return response()->json(['message' => 'Enregistrement restauré avec succès']);
    }

    public function forceDelete(int $id): JsonResponse
    {
        $user = auth()->user();
        $niveau = $user->role->niveau ?? 99;

        if ($niveau > 1) {
            return response()->json(['message' => 'Accès refusé'], 403);
        }

        $corbeille = Corbeille::find($id);

        if (!$corbeille) {
            return response()->json(['message' => 'Non trouvé'], 404);
        }

        $corbeille->delete();

        if (class_exists(\App\Models\JournalAudit::class)) {
            try {
                \App\Models\JournalAudit::create([
                    'utilisateur_id'    => $user->id,
                    'action'            => 'FORCE_DELETE',
                    'table_cible'       => $corbeille->model_type,
                    'enregistrement_id' => $corbeille->model_id,
                    'adresse_ip'        => request()->ip(),
                    'resultat'          => 'success',
                    'date_action'       => now(),
                ]);
            } catch (\Exception $e) {
                // silent fallback — audit failure must not block delete
            }
        }

        return response()->json(['message' => 'Supprimé définitivement']);
    }
}
