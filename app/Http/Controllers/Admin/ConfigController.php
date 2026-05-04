<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Traits\Auditable;
use App\Models\SystemConfig;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ConfigController extends Controller
{
    use Auditable;

    private const ALLOWED_SECTIONS = ['general', 'email', 'notifications', 'maintenance'];

    // =========================================================================
    // GET /api/admin/system-config
    // Returns all system_config rows as a flat { key: value } object
    // =========================================================================

    public function index(): JsonResponse
    {
        $config = SystemConfig::all(['key', 'value'])
            ->pluck('value', 'key')
            ->toArray();

        return response()->json($config);
    }

    // =========================================================================
    // POST /api/admin/system-config/{section}
    // Upserts all key/value pairs for the given section.
    // Logs the change via Auditable trait.
    // =========================================================================

    public function update(Request $request, string $section): JsonResponse
    {
        if (!in_array($section, self::ALLOWED_SECTIONS, true)) {
            abort(422, 'Invalid configuration section.');
        }

        $data = $request->validate([
            '*' => 'nullable|string|max:1000',
        ]);

        // Capture previous values for audit log
        $old = SystemConfig::whereIn('key', array_keys($data))
            ->get(['key', 'value'])
            ->pluck('value', 'key')
            ->toArray();

        foreach ($data as $key => $value) {
            SystemConfig::updateOrCreate(
                ['key' => $key],
                ['value' => $value ?? '']
            );
        }

        $this->audit(
            'UPDATE',
            'system_config',
            null,
            ['section' => $section, 'values' => $old],
            ['section' => $section, 'values' => $data]
        );

        return response()->json(['message' => 'Sauvegardé avec succès.']);
    }

    // =========================================================================
    // POST /api/admin/system-config/test-email
    // Sends a test email using current SMTP config from system_config
    // =========================================================================
    public function testEmail(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        try {
            \Illuminate\Support\Facades\Mail::raw(
                "Ceci est un email de test depuis NASHCO GSLC.\n\nSi vous recevez cet email, la configuration SMTP est correcte.",
                function ($message) use ($request) {
                    $message->to($request->email)
                            ->subject('Test SMTP — NASHCO GSLC');
                }
            );

            return response()->json(['message' => 'Email de test envoyé avec succès.']);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Échec de l\'envoi: ' . $e->getMessage()
            ], 500);
        }
    }
}
