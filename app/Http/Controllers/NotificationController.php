<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    // =========================================================================
    // INDEX — notifications for current user, unread first
    // =========================================================================

    public function index(): JsonResponse
    {
        $notifications = Notification::where('destinataire_id', Auth::id())
            ->orderBy('lu')               // unread (0) first
            ->orderByDesc('date_creation')
            ->paginate(20);

        $unreadCount = Notification::where('destinataire_id', Auth::id())
            ->where('lu', false)
            ->count();

        return response()->json([
            'notifications' => $notifications,
            'unread_count'  => $unreadCount,
        ]);
    }

    // =========================================================================
    // MARK READ
    // =========================================================================

    public function markRead(int $id): JsonResponse
    {
        $notification = Notification::where('destinataire_id', Auth::id())
            ->findOrFail($id);

        $notification->marquerLu();

        return response()->json([
            'message' => 'Notification marquée comme lue.',
        ]);
    }
}
