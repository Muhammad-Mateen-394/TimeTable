<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\AppNotification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $items = AppNotification::where('user_id', $request->user()->id)->latest()->paginate(50);
        return response()->json(['success' => true, 'data' => $items]);
    }

    public function read(Request $request, AppNotification $notification)
    {
        abort_unless($notification->user_id === $request->user()->id, 404);
        $notification->update(['read_at' => now()]);
        return response()->json(['success' => true, 'data' => $notification]);
    }

    public function readAll(Request $request)
    {
        AppNotification::where('user_id', $request->user()->id)->whereNull('read_at')->update(['read_at' => now()]);
        return response()->json(['success' => true, 'message' => 'Notifications marked as read.']);
    }

    public function destroy(Request $request, AppNotification $notification)
    {
        abort_unless($notification->user_id === $request->user()->id, 404);
        $notification->delete();
        return response()->json(['success' => true, 'message' => 'Notification deleted.']);
    }
}
