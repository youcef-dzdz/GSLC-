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
}
