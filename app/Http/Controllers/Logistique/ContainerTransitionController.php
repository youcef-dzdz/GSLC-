<?php

namespace App\Http\Controllers\Logistique;

use App\Http\Controllers\Controller;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;
use Exception;

class ContainerTransitionController extends Controller
{
    /**
     * Transition a container from Phase 2 (Admin) to Phase 3 (Ops)
     * Requirements: 12-Role RBAC check (implied user role logic), Surestary Calculation, and Audit trail.
     */
    public function transitionToOps(Request $request, $containerId)
    {
        try {
            DB::beginTransaction();

            // 1. RBAC Matrix Check: Only certain roles can validate Phase 2 to Phase 3.
            // Example: 'Responsable' role must validate.
            // $user = $request->user();
            // if (!$user->hasRole('Responsable')) { ... abort 403 ... }

            // Using Query Builder or Eloquent for container
            $container = DB::table('containers')->where('id', $containerId)->first();

            if (!$container) {
                return response()->json(['message' => 'Container not found.'], 404);
            }

            if ($container->status_phase !== 'Admin') {
                return response()->json(['message' => 'Container is not in Phase 2 (Admin).'], 400);
            }

            // 2. Surestary Engine / Demurrage Logic 
            // Calculate penalty if return_date exceeds arrival_date + free_days
            $amountSurestary = 0;
            if ($container->arrival_date && $container->return_date && $container->free_days > 0) {
                $arrival = Carbon::parse($container->arrival_date);
                $return  = Carbon::parse($container->return_date);
                
                // Effective allowed days
                $deadline = $arrival->copy()->addDays($container->free_days);
                
                if ($return->greaterThan($deadline)) {
                    $delayDays = $deadline->diffInDays($return);
                    // Standard cost per day, perhaps from config or environment
                    $dailyRate = config('gslc.demurrage_daily_rate', 5000); // e.g., 5000 DZD per day
                    $amountSurestary = $delayDays * $dailyRate;
                }
            }

            // 3. Preparation of Audit Payload
            $payload = json_encode([
                'action' => 'TRANSITION_ADMIN_TO_OPS',
                'previous_phase' => 'Admin',
                'new_phase' => 'Ops',
                'calculated_surestary' => $amountSurestary,
                'request_data' => $request->all()
            ]);

            // 4. Record Update inside Transaction (Audit Trail)
            DB::table('containers')->where('id', $containerId)->update([
                'status_phase' => 'Ops',
                'user_id'      => $request->user() ? $request->user()->id : null,
                'ip_address'   => $request->ip(),
                'payload_json' => $payload,
                'updated_at'   => Carbon::now()
            ]);

            // 5. Generate Invoice if Surestary is present
            if ($amountSurestary > 0) {
                DB::table('invoices')->insert([
                    'container_id'     => $containerId,
                    'dossier_id'       => $container->dossier_id,
                    'amount_surestary' => $amountSurestary,
                    'user_id'          => $request->user() ? $request->user()->id : null,
                    'ip_address'       => $request->ip(),
                    'payload_json'     => json_encode(['source' => 'auto-generated Surestary']),
                    'created_at'       => Carbon::now(),
                    'updated_at'       => Carbon::now()
                ]);
            }

            DB::commit();

            return response()->json([
                'message' => 'Container successfully transitioned to Phase 3 (Ops).',
                'data' => [
                    'container_id' => $containerId,
                    'surestary_fee' => $amountSurestary
                ]
            ], 200);

        } catch (Exception $e) {
            DB::rollBack();
            Log::error('Transition Error: ' . $e->getMessage());
            return response()->json(['message' => 'Transition failed due to server error.'], 500);
        }
    }
}
