<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UploadDocumentRequest;
use App\Models\Document;
use App\Models\JournalAudit;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class DocumentController extends Controller
{
    /**
     * Upload and store a document securely.
     * Files go to the private 'documents' disk — never public.
     */
    public function store(UploadDocumentRequest $request): JsonResponse
    {
        $user = $request->user();
        $file = $request->file('file');

        // Validate real MIME type from file contents, not just extension
        $realMime = $file->getMimeType();
        $allowed  = ['application/pdf', 'image/jpeg', 'image/png'];

        if (!in_array($realMime, $allowed)) {
            return response()->json([
                'message' => 'Type de fichier non autorisé.',
                'mime'    => $realMime,
            ], 422);
        }

        // Generate a random storage name — never expose the original filename
        $extension   = strtolower($file->getClientOriginalExtension());
        $nomStockage = Str::uuid() . '.' . $extension;

        // Store in private disk — not publicly accessible
        $chemin = Storage::disk('documents')->putFileAs('', $file, $nomStockage);

        $document = Document::create([
            'client_id'        => $request->client_id,
            'demande_id'       => $request->demande_id,
            'nom_original'     => $file->getClientOriginalName(),
            'nom_stockage'     => $nomStockage,
            'type_document'    => $request->type_document,
            'extension'        => $extension,
            'chemin_stockage'  => $chemin,
            'taille'           => $file->getSize(),
            'statut'           => 'EN_ATTENTE_VALIDATION',
            'date_expiration'  => $request->date_expiration,
        ]);

        try {
            JournalAudit::create([
                'utilisateur_id'    => $user->id,
                'action'            => 'UPLOAD',
                'table_cible'       => 'documents',
                'enregistrement_id' => $document->id,
                'nouvelles_valeurs' => [
                    'nom_original'  => $document->nom_original,
                    'type_document' => $document->type_document,
                    'taille'        => $document->taille,
                ],
                'adresse_ip'        => $request->ip(),
                'resultat'          => 'success',
                'date_action'       => now(),
            ]);
        } catch (\Exception $e) {
            // silent fallback — audit failure must not block upload
        }

        return response()->json([
            'message'  => 'Document téléversé avec succès.',
            'document' => [
                'id'            => $document->id,
                'nom_original'  => $document->nom_original,
                'type_document' => $document->type_document,
                'taille'        => $document->tailleFormatee(),
                'statut'        => $document->statut,
            ],
        ], 201);
    }

    /**
     * Serve a document via a temporary signed URL (admin/it_agent only).
     * File is streamed — path is never exposed to the client.
     */
    public function download(Request $request, int $id): mixed
    {
        $document = Document::findOrFail($id);

        if (!Storage::disk('documents')->exists($document->nom_stockage)) {
            return response()->json(['message' => 'Fichier introuvable.'], 404);
        }

        try {
            JournalAudit::create([
                'utilisateur_id'    => $request->user()->id,
                'action'            => 'DOWNLOAD',
                'table_cible'       => 'documents',
                'enregistrement_id' => $document->id,
                'adresse_ip'        => $request->ip(),
                'resultat'          => 'success',
                'date_action'       => now(),
            ]);
        } catch (\Exception $e) {
            // silent fallback
        }

        return Storage::disk('documents')->download(
            $document->nom_stockage,
            $document->nom_original
        );
    }

    /**
     * List documents — filterable by client, demande, type, statut.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Document::query();

        if ($request->filled('client_id')) {
            $query->where('client_id', $request->client_id);
        }
        if ($request->filled('demande_id')) {
            $query->where('demande_id', $request->demande_id);
        }
        if ($request->filled('type_document')) {
            $query->where('type_document', $request->type_document);
        }
        if ($request->filled('statut')) {
            $query->where('statut', $request->statut);
        }

        $documents = $query->orderBy('created_at', 'desc')->paginate(20);

        return response()->json($documents);
    }

    /**
     * Validate or reject a document (admin only).
     */
    public function valider(Request $request, int $id): JsonResponse
    {
        $user     = $request->user();
        $document = Document::findOrFail($id);

        $request->validate([
            'statut'       => 'required|in:VALIDE,REJETE',
            'motif_rejet'  => 'required_if:statut,REJETE|nullable|string|max:500',
        ]);

        $anciennes = ['statut' => $document->statut];

        $document->update([
            'statut'              => $request->statut,
            'valide_par_user_id'  => $user->id,
            'date_validation'     => now(),
            'motif_rejet'         => $request->statut === 'REJETE' ? $request->motif_rejet : null,
        ]);

        try {
            JournalAudit::create([
                'utilisateur_id'    => $user->id,
                'action'            => 'VALIDER_DOCUMENT',
                'table_cible'       => 'documents',
                'enregistrement_id' => $document->id,
                'anciennes_valeurs' => $anciennes,
                'nouvelles_valeurs' => ['statut' => $request->statut],
                'adresse_ip'        => $request->ip(),
                'resultat'          => 'success',
                'date_action'       => now(),
            ]);
        } catch (\Exception $e) {
            // silent fallback
        }

        return response()->json([
            'message'  => 'Statut du document mis à jour.',
            'document' => [
                'id'             => $document->id,
                'statut'         => $document->statut,
                'date_validation'=> $document->date_validation,
                'motif_rejet'    => $document->motif_rejet,
            ],
        ]);
    }
}
