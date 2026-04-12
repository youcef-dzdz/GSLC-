<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;

class AuditController extends Controller
{
    /**
     * GET /api/admin/audit-logs
     * Supports: user (nom/prenom search), action, date_debut, date_fin, page
     * Returns paginated journal_audits rows joined with users.
     */
    public function index(Request $request): JsonResponse
    {
        $query = DB::table('journal_audits as j')
            ->leftJoin('users as u', 'u.id', '=', 'j.utilisateur_id')
            ->select(
                'j.id',
                'j.action',
                'j.table_cible',
                'j.enregistrement_id',
                'j.nouvelles_valeurs',
                'j.anciennes_valeurs',
                'j.adresse_ip',
                'j.resultat',
                'j.date_action',
                'u.nom',
                'u.prenom',
                'u.email'
            )
            ->orderByDesc('j.date_action');

        // Filter by user name / prenom / email
        if ($request->filled('user')) {
            $s = $request->user;
            $query->where(function ($q) use ($s) {
                $q->where('u.nom',    'ilike', "%{$s}%")
                  ->orWhere('u.prenom', 'ilike', "%{$s}%")
                  ->orWhere('u.email',  'ilike', "%{$s}%");
            });
        }

        // Filter by action type
        if ($request->filled('action')) {
            $query->where('j.action', $request->action);
        }

        // Filter by date range
        if ($request->filled('date_debut')) {
            $query->whereDate('j.date_action', '>=', $request->date_debut);
        }
        if ($request->filled('date_fin')) {
            $query->whereDate('j.date_action', '<=', $request->date_fin);
        }

        $paginated = $query->paginate(20);

        // Format each row
        $paginated->getCollection()->transform(function ($row) {
            $utilisateur = trim(($row->prenom ?? '') . ' ' . ($row->nom ?? ''));

            return [
                'id'              => $row->id,
                'utilisateur'     => $utilisateur ?: ($row->email ?? 'Système'),
                'action'          => $row->action,
                'table_cible'     => $row->table_cible,
                'enregistrement_id' => $row->enregistrement_id,
                'description'     => $this->buildDescription($row),
                'adresse_ip'      => $row->adresse_ip,
                'resultat'        => $row->resultat,
                'date_action'     => $row->date_action,
            ];
        });

        return response()->json($paginated);
    }

    /**
     * GET /api/admin/audit-logs/export
     * Returns all matching rows (no pagination) as a downloadable CSV file.
     * Accepts the same filter params as index(): user, action, date_debut, date_fin.
     */
    public function export(Request $request): Response
    {
        $query = DB::table('journal_audits as j')
            ->leftJoin('users as u', 'u.id', '=', 'j.utilisateur_id')
            ->select(
                'j.action',
                'j.table_cible',
                'j.enregistrement_id',
                'j.nouvelles_valeurs',
                'j.adresse_ip',
                'j.date_action',
                'u.nom',
                'u.prenom',
                'u.email'
            )
            ->orderByDesc('j.date_action');

        if ($request->filled('user')) {
            $s = $request->user;
            $query->where(function ($q) use ($s) {
                $q->where('u.nom',    'ilike', "%{$s}%")
                  ->orWhere('u.prenom', 'ilike', "%{$s}%")
                  ->orWhere('u.email',  'ilike', "%{$s}%");
            });
        }
        if ($request->filled('action')) {
            $query->where('j.action', $request->action);
        }
        if ($request->filled('date_debut')) {
            $query->whereDate('j.date_action', '>=', $request->date_debut);
        }
        if ($request->filled('date_fin')) {
            $query->whereDate('j.date_action', '<=', $request->date_fin);
        }

        $rows = $query->get();

        $columns = ['utilisateur', 'action', 'table_cible', 'description', 'adresse_ip', 'date_heure'];

        $csv = implode(',', array_map(fn($c) => '"' . $c . '"', $columns)) . "\n";

        foreach ($rows as $row) {
            $utilisateur = trim(($row->prenom ?? '') . ' ' . ($row->nom ?? ''))
                           ?: ($row->email ?? 'Système');
            $description = $this->buildDescription($row);

            $csv .= implode(',', array_map(
                fn($v) => '"' . str_replace('"', '""', $v ?? '') . '"',
                [
                    $utilisateur,
                    $row->action,
                    $row->table_cible,
                    $description,
                    $row->adresse_ip ?? '',
                    $row->date_action,
                ]
            )) . "\n";
        }

        $today    = now()->format('Y-m-d');
        $filename = "audit_log_{$today}.csv";

        return response($csv, 200, [
            'Content-Type'        => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ]);
    }

    private function buildDescription(object $row): string
    {
        $target = $row->table_cible . ($row->enregistrement_id ? " #{$row->enregistrement_id}" : '');

        switch ($row->action) {
            case 'LOGIN':
                return "Connexion sur {$target}";
            case 'LOGOUT':
                return "Déconnexion de {$target}";
            case 'CREATE':
                return "Création dans {$target}";
            case 'UPDATE':
                $vals = $row->nouvelles_valeurs ? json_decode($row->nouvelles_valeurs, true) : null;
                $fields = $vals ? implode(', ', array_keys($vals)) : '';
                return "Modification de {$target}" . ($fields ? " ({$fields})" : '');
            case 'DELETE':
                return "Suppression de {$target}";
            case 'BLOCK':
                return "Blocage de {$target}";
            case 'EXPORT':
                return "Export de {$target}";
            default:
                return "{$row->action} sur {$target}";
        }
    }
}
