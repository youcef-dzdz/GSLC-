<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\DirecteurController;
use App\Http\Controllers\CommercialController;
use App\Http\Controllers\DemandeImportController;
use App\Http\Controllers\DevisController;
use App\Http\Controllers\ContratImportController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\NavireController;
use App\Http\Controllers\LogistiqueController;
use App\Http\Controllers\ConteneurController;
use App\Http\Controllers\MouvementController;
use App\Http\Controllers\FinancierController;
use App\Http\Controllers\FactureController;
use App\Http\Controllers\ClientPortalController;
use App\Http\Controllers\ClientDemandeController;
use App\Http\Controllers\NotificationController;

// =============================================================================
// PUBLIC — no authentication required
// =============================================================================

Route::post('/login',    [AuthController::class, 'login'])->name('api.login');
Route::post('/register', [AuthController::class, 'register'])->name('api.register');

// =============================================================================
// PROTECTED — must be logged in
// =============================================================================

Route::middleware('auth:sanctum')->group(function () {

    // Shared — all authenticated users
    Route::get('/user',                            [AuthController::class, 'me'])->name('api.user');
    Route::post('/logout',                         [AuthController::class, 'logout'])->name('api.logout');
    Route::get('/notifications',                   [NotificationController::class, 'index'])->name('notifications.index');
    Route::post('/notifications/{id}/read',        [NotificationController::class, 'markRead'])->name('notifications.read');

    // =========================================================================
    // ADMIN
    // =========================================================================
    Route::middleware('role:admin')->prefix('admin')->name('admin.')->group(function () {
        Route::get('/dashboard',                   [AdminController::class, 'dashboard'])->name('dashboard');
        Route::get('/users',                       [UserController::class, 'index'])->name('users.index');
        Route::post('/users',                      [UserController::class, 'store'])->name('users.store');
        Route::get('/users/{id}',                  [UserController::class, 'show'])->name('users.show');
        Route::put('/users/{id}',                  [UserController::class, 'update'])->name('users.update');
        Route::delete('/users/{id}',               [UserController::class, 'destroy'])->name('users.destroy');
        Route::get('/registrations',               [AdminController::class, 'registrations'])->name('registrations.index');
        Route::post('/registrations/{id}/approve', [AdminController::class, 'approveRegistration'])->name('registrations.approve');
        Route::post('/registrations/{id}/reject',  [AdminController::class, 'rejectRegistration'])->name('registrations.reject');
        Route::get('/audit',                       [AdminController::class, 'auditLog'])->name('audit');
        Route::get('/config',                      [AdminController::class, 'config'])->name('config.index');
        Route::post('/config',                     [AdminController::class, 'updateConfig'])->name('config.update');
    });

    // =========================================================================
    // DIRECTEUR
    // =========================================================================
    Route::middleware('role:directeur')->prefix('director')->name('director.')->group(function () {
        Route::get('/dashboard',                   [DirecteurController::class, 'dashboard'])->name('dashboard');
        Route::get('/reports',                     [DirecteurController::class, 'reports'])->name('reports');
        Route::get('/contracts/pending',           [DirecteurController::class, 'pendingContracts'])->name('contracts.pending');
        Route::post('/contracts/{id}/approve',     [DirecteurController::class, 'approveContract'])->name('contracts.approve');
        Route::post('/contracts/{id}/return',      [DirecteurController::class, 'returnContract'])->name('contracts.return');
    });

    // =========================================================================
    // COMMERCIAL
    // =========================================================================
    Route::middleware('role:commercial')->prefix('commercial')->name('commercial.')->group(function () {
        Route::get('/dashboard',                   [CommercialController::class, 'dashboard'])->name('dashboard');
        Route::get('/demands',                     [DemandeImportController::class, 'index'])->name('demands.index');
        Route::post('/demands',                    [DemandeImportController::class, 'store'])->name('demands.store');
        Route::get('/demands/{id}',                [DemandeImportController::class, 'show'])->name('demands.show');
        Route::put('/demands/{id}',                [DemandeImportController::class, 'update'])->name('demands.update');
        Route::get('/quotes',                      [DevisController::class, 'index'])->name('quotes.index');
        Route::post('/quotes',                     [DevisController::class, 'store'])->name('quotes.store');
        Route::get('/quotes/{id}',                 [DevisController::class, 'show'])->name('quotes.show');
        Route::put('/quotes/{id}',                 [DevisController::class, 'update'])->name('quotes.update');
        Route::get('/contracts',                   [ContratImportController::class, 'index'])->name('contracts.index');
        Route::post('/contracts',                  [ContratImportController::class, 'store'])->name('contracts.store');
        Route::get('/contracts/{id}',              [ContratImportController::class, 'show'])->name('contracts.show');
        Route::post('/contracts/{id}/activate',    [ContratImportController::class, 'activate'])->name('contracts.activate');
        Route::get('/clients',                     [ClientController::class, 'index'])->name('clients.index');
        Route::post('/clients',                    [ClientController::class, 'store'])->name('clients.store');
        Route::get('/clients/{id}',                [ClientController::class, 'show'])->name('clients.show');
        Route::put('/clients/{id}',                [ClientController::class, 'update'])->name('clients.update');
        Route::get('/vessels',                     [NavireController::class, 'index'])->name('vessels.index');
        Route::post('/vessels',                    [NavireController::class, 'store'])->name('vessels.store');
        Route::get('/vessels/{id}',                [NavireController::class, 'show'])->name('vessels.show');
    });

    // =========================================================================
    // LOGISTIQUE
    // =========================================================================
    Route::middleware('role:logistique')->prefix('logistics')->name('logistics.')->group(function () {
        Route::get('/dashboard',                   [LogistiqueController::class, 'dashboard'])->name('dashboard');
        Route::get('/containers',                  [ConteneurController::class, 'index'])->name('containers.index');
        Route::get('/containers/{id}',             [ConteneurController::class, 'show'])->name('containers.show');
        Route::post('/containers/{id}/status',     [ConteneurController::class, 'changeStatus'])->name('containers.status');
        Route::get('/warehouse',                   [LogistiqueController::class, 'warehouse'])->name('warehouse');
        Route::get('/vessels',                     [LogistiqueController::class, 'vesselSchedule'])->name('vessels');
        Route::post('/vessels/{id}/arrive',        [LogistiqueController::class, 'registerArrival'])->name('vessels.arrive');
        Route::get('/movements',                   [MouvementController::class, 'index'])->name('movements.index');
    });

    // =========================================================================
    // FINANCIER
    // =========================================================================
    Route::middleware('role:financier')->prefix('finance')->name('finance.')->group(function () {
        Route::get('/dashboard',                   [FinancierController::class, 'dashboard'])->name('dashboard');
        Route::get('/invoices',                    [FactureController::class, 'index'])->name('invoices.index');
        Route::post('/invoices',                   [FactureController::class, 'store'])->name('invoices.store');
        Route::get('/invoices/{id}',               [FactureController::class, 'show'])->name('invoices.show');
        Route::post('/invoices/{id}/emit',         [FactureController::class, 'emit'])->name('invoices.emit');
        Route::post('/invoices/{id}/payment',      [FactureController::class, 'recordPayment'])->name('invoices.payment');
        Route::post('/invoices/{id}/legal',        [FactureController::class, 'legalAction'])->name('invoices.legal');
        Route::get('/payments',                    [FactureController::class, 'payments'])->name('payments.index');
    });

    // =========================================================================
    // CLIENT PORTAL
    // =========================================================================
    Route::middleware('role:client')->prefix('client')->name('client.')->group(function () {
        Route::get('/dashboard',                   [ClientPortalController::class, 'dashboard'])->name('dashboard');
        Route::get('/demands',                     [ClientDemandeController::class, 'index'])->name('demands.index');
        Route::post('/demands',                    [ClientDemandeController::class, 'store'])->name('demands.store');
        Route::get('/demands/{id}',                [ClientDemandeController::class, 'show'])->name('demands.show');
        Route::get('/quotes/{id}',                 [ClientPortalController::class, 'showQuote'])->name('quotes.show');
        Route::post('/quotes/{id}/accept',         [ClientPortalController::class, 'acceptQuote'])->name('quotes.accept');
        Route::post('/quotes/{id}/reject',         [ClientPortalController::class, 'rejectQuote'])->name('quotes.reject');
        Route::post('/quotes/{id}/modify',         [ClientPortalController::class, 'requestModification'])->name('quotes.modify');
        Route::get('/contracts',                   [ClientPortalController::class, 'contracts'])->name('contracts.index');
        Route::get('/contracts/{id}/sign',         [ClientPortalController::class, 'showSignature'])->name('contracts.sign');
        Route::post('/contracts/{id}/sign',        [ClientPortalController::class, 'submitSignature'])->name('contracts.sign.submit');
        Route::get('/invoices',                    [ClientPortalController::class, 'invoices'])->name('invoices.index');
        Route::get('/invoices/{id}/pdf',           [ClientPortalController::class, 'downloadInvoice'])->name('invoices.pdf');
        Route::get('/containers',                  [ClientPortalController::class, 'containers'])->name('containers.index');
    });

});
