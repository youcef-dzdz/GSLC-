<?php

namespace App\Http\Controllers\Traits;

use App\Models\JournalAudit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

/**
 * Auditable — reusable audit logging for all controllers.
 *
 * Real column names from journal_audits:
 *   utilisateur_id, action, table_cible, enregistrement_id,
 *   anciennes_valeurs, nouvelles_valeurs, adresse_ip,
 *   user_agent, resultat, date_action
 *
 * Usage inside any controller method:
 *   $this->audit('CREATE', 'clients', $client->id, null, $client->toArray());
 *   $this->audit('UPDATE', 'devis', $devis->id, $old, $new);
 *   $this->audit('DELETE', 'users', $user->id, $user->toArray(), null);
 */
trait Auditable
{
    /**
     * Write one row to journal_audits.
     *
     * @param string     $action           CREATE | UPDATE | DELETE | LOGIN | LOGOUT
     * @param string     $tableCible       name of the affected table
     * @param int|null   $enregistrementId primary key of the affected row
     * @param array|null $anciennesValeurs state before the change (null for CREATE)
     * @param array|null $nouvellesValeurs state after the change  (null for DELETE)
     * @param string     $resultat         SUCCES | ECHEC
     */
    protected function audit(
        string  $action,
        string  $tableCible,
        ?int    $enregistrementId = null,
        ?array  $anciennesValeurs = null,
        ?array  $nouvellesValeurs = null,
        string  $resultat = 'SUCCES'
    ): void {
        JournalAudit::create([
            'utilisateur_id'    => Auth::id(),
            'action'            => $action,
            'table_cible'       => $tableCible,
            'enregistrement_id' => $enregistrementId,
            'anciennes_valeurs' => $anciennesValeurs, // cast to array by model
            'nouvelles_valeurs' => $nouvellesValeurs, // cast to array by model
            'adresse_ip'        => request()->ip(),
            'user_agent'        => request()->userAgent(),
            'resultat'          => $resultat,
            'date_action'       => now(),
        ]);
    }
}
