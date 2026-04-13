<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    // =========================================================================
    // INDEX — 10 notifications non lues de l'admin connecté (bell uniquement)
    // =========================================================================

    public function index(): JsonResponse
    {
        $notifications = Notification::where('destinataire_id', Auth::id())
            ->where('lu', false)
            ->orderByDesc('date_creation')
            ->limit(10)
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
    // ALL — toutes les notifications (page complète)
    // GET /api/admin/notifications/all
    // =========================================================================

    public function all(): JsonResponse
    {
        $notifications = Notification::where('destinataire_id', Auth::id())
            ->orderByDesc('date_creation')
            ->limit(100)
            ->get(['id', 'titre', 'message', 'lu', 'lien_action', 'date_creation', 'canal']);

        return response()->json([
            'notifications' => $notifications,
            'total'         => $notifications->count(),
            'unread_count'  => $notifications->where('lu', false)->count(),
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

    // =========================================================================
    // DESTROY — supprimer une notification (hard delete)
    // DELETE /api/admin/notifications/{id}
    // =========================================================================

    public function destroy(int $id): JsonResponse
    {
        $notification = Notification::where('destinataire_id', Auth::id())
            ->findOrFail($id);

        $notification->delete();

        return response()->json(['success' => true]);
    }

    // =========================================================================
    // DESTROY READ — supprimer toutes les notifications lues
    // DELETE /api/admin/notifications/read
    // =========================================================================

    public function destroyRead(): JsonResponse
    {
        $count = Notification::where('destinataire_id', Auth::id())
            ->where('lu', true)
            ->count();

        Notification::where('destinataire_id', Auth::id())
            ->where('lu', true)
            ->delete();

        return response()->json(['success' => true, 'deleted' => $count]);
    }
}
