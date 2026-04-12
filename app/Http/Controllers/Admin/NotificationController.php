<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    // =========================================================================
    // INDEX — 20 dernières notifications de l'admin connecté
    // =========================================================================

    public function index(): JsonResponse
    {
        $notifications = Notification::where('destinataire_id', Auth::id())
            ->orderByDesc('date_creation')
            ->limit(20)
            ->get(['id', 'titre', 'message', 'lu', 'lien_action', 'date_creation', 'canal']);

        $unreadCount = Notification::where('destinataire_id', Auth::id())
            ->where('lu', false)
            ->count();

        return response()->json([
            'notifications' => $notifications,
            'unread_count'  => $unreadCount,
        ]);
    }

    // =========================================================================
    // MARK READ — marquer une notification comme lue
    // =========================================================================

    public function markRead(int $id): JsonResponse
    {
        $notification = Notification::where('destinataire_id', Auth::id())
            ->findOrFail($id);

        $notification->marquerLu();

        return response()->json(['success' => true]);
    }

    // =========================================================================
    // MARK ALL READ — marquer toutes les notifications non lues comme lues
    // =========================================================================

    public function markAllRead(): JsonResponse
    {
        $count = Notification::where('destinataire_id', Auth::id())
            ->where('lu', false)
            ->count();

        Notification::where('destinataire_id', Auth::id())
            ->where('lu', false)
            ->update([
                'lu'    => true,
                'lu_le' => now(),
            ]);

        return response()->json(['success' => true, 'count' => $count]);
    }
}
