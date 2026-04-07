<?php
namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Http\Requests\ContactMessageRequest;
use App\Models\ContactMessage;
use App\Mail\ContactMessageReceived;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class ContactMessageController extends Controller
{
    public function store(ContactMessageRequest $request)
    {
        try {
            $contactMessage = ContactMessage::create($request->validated() + ['ip_address' => $request->ip()]);

            Mail::queue(new ContactMessageReceived($contactMessage));

            return response()->json(['success' => true], 201);
        } catch (\Exception $e) {
            Log::error('Contact form error: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Erreur serveur'], 500);
        }
    }
}
