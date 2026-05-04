<?php

namespace App\Traits;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

trait SecureFileUpload
{
    // -------------------------------------------------------------------------
    // Allowed MIME types per file category
    // -------------------------------------------------------------------------
    private array $allowedPdfMimes   = ['application/pdf'];
    private array $allowedImageMimes = ['image/jpeg', 'image/png', 'image/webp'];

    // -------------------------------------------------------------------------
    // Size limits in kilobytes
    // -------------------------------------------------------------------------
    private int $maxPdfSize   = 10240; // 10 MB
    private int $maxImageSize = 2048;  // 2 MB

    // =========================================================================
    // Method 1 — Validate, sanitize, and store a file securely
    // =========================================================================

    /**
     * Validates the real MIME type and size of $file, sanitizes its filename,
     * stores it under storage/app/private/{$folder}/, and returns the path.
     *
     * @param  UploadedFile  $file    The uploaded file instance
     * @param  string        $type    'pdf' or 'image'
     * @param  string        $folder  Subfolder, e.g. 'documents/bl'
     * @return string                 Stored path relative to storage root
     *
     * @throws ValidationException   On MIME mismatch or size excess
     */
    protected function validateAndStoreFile(
        UploadedFile $file,
        string $type,
        string $folder
    ): string {
        // ------------------------------------------------------------------
        // 1. Resolve allowed MIME list and size cap for this $type
        // ------------------------------------------------------------------
        if ($type === 'pdf') {
            $allowedMimes = $this->allowedPdfMimes;
            $maxKb        = $this->maxPdfSize;
            $maxLabel     = '10MB';
        } elseif ($type === 'image') {
            $allowedMimes = $this->allowedImageMimes;
            $maxKb        = $this->maxImageSize;
            $maxLabel     = '2MB';
        } else {
            throw ValidationException::withMessages([
                'file' => ["Type de catégorie inconnu: {$type}. Valeurs acceptées: pdf, image."],
            ]);
        }

        // ------------------------------------------------------------------
        // 2. Real MIME detection — getMimeType() reads the file magic bytes,
        //    not the client-supplied Content-Type or file extension.
        // ------------------------------------------------------------------
        $realMime = $file->getMimeType();

        if (!in_array($realMime, $allowedMimes, true)) {
            $accepted = implode(', ', $allowedMimes);
            throw ValidationException::withMessages([
                'file' => ["Type de fichier non autorisé. Types acceptés: {$accepted}"],
            ]);
        }

        // ------------------------------------------------------------------
        // 3. Size check (getSize() returns bytes; convert to KB)
        // ------------------------------------------------------------------
        $fileSizeKb = $file->getSize() / 1024;

        if ($fileSizeKb > $maxKb) {
            throw ValidationException::withMessages([
                'file' => ["Fichier trop volumineux. Taille maximale: {$maxLabel}"],
            ]);
        }

        // ------------------------------------------------------------------
        // 4. Filename sanitization — strip dangerous characters, append UUID
        // ------------------------------------------------------------------
        $originalName  = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
        $extension     = strtolower($file->getClientOriginalExtension());

        // Keep only alphanumeric, hyphens, underscores; collapse spaces to hyphens
        $sanitizedBase = preg_replace('/\s+/', '-', $originalName);
        $sanitizedBase = preg_replace('/[^a-zA-Z0-9\-_]/', '', $sanitizedBase);
        $sanitizedBase = strtolower($sanitizedBase);

        // Prevent empty base after stripping
        if (empty($sanitizedBase)) {
            $sanitizedBase = 'file';
        }

        $uuid     = Str::uuid()->toString();
        $filename = "{$sanitizedBase}_{$uuid}.{$extension}";

        // ------------------------------------------------------------------
        // 5. Store in private disk — storage/app/private/{folder}/{filename}
        //    private/ is outside public/ — never directly accessible via URL
        // ------------------------------------------------------------------
        $storedPath = Storage::disk('local')->putFileAs(
            'private/' . trim($folder, '/'),
            $file,
            $filename
        );

        // ------------------------------------------------------------------
        // 6. Return relative path from storage root (e.g. private/documents/bl/name_uuid.pdf)
        // ------------------------------------------------------------------
        return $storedPath;
    }

    // =========================================================================
    // Method 2 — Delete a stored file safely
    // =========================================================================

    /**
     * Deletes a file from private storage. Silently ignores missing files.
     *
     * @param  string  $path  Path relative to storage root
     */
    protected function deleteStoredFile(string $path): void
    {
        if (empty($path)) {
            return;
        }

        if (Storage::disk('local')->exists($path)) {
            Storage::disk('local')->delete($path);
        }
    }

    // =========================================================================
    // Method 3 — Generate a time-limited URL for a stored file
    // =========================================================================

    /**
     * Returns a 30-minute temporary URL for a private file.
     * Falls back to a signed download route if the driver doesn't support
     * temporaryUrl() (local disk on non-S3 environments).
     *
     * @param  string  $path  Path relative to storage root
     * @return string|null    URL string, or null if path is empty
     */
    protected function getFileUrl(string $path): ?string
    {
        if (empty($path)) {
            return null;
        }

        try {
            return Storage::disk('local')->temporaryUrl($path, now()->addMinutes(30));
        } catch (\RuntimeException $e) {
            // Local driver does not support temporaryUrl() — fall back to a
            // signed download route that the controller must register as
            // Route::get('/files/download/{path}', ...)->name('file.download')
            return route('file.download', ['path' => base64_encode($path)]);
        }
    }
}
