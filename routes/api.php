<?php

use Illuminate\Support\Facades\Route;
// Auth
use App\Http\Controllers\Auth\AuthController;

// Admin
use App\Http\Controllers\Admin\AdminController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\DepartmentController;
use App\Http\Controllers\Admin\PositionController;
use App\Http\Controllers\Admin\DeviseController;
use App\Http\Controllers\Admin\AuditController;
use App\Http\Controllers\Admin\ConfigController;
use App\Http\Controllers\Admin\NotificationController as AdminNotificationController;

// Client Portal
use App\Http\Controllers\Client\ClientController;
use App\Http\Controllers\Client\ClientPortalController;
use App\Http\Controllers\Client\ClientDemandeController;

// Commercial
use App\Http\Controllers\Commercial\CommercialController;
use App\Http\Controllers\Commercial\DemandeImportController;
use App\Http\Controllers\Commercial\DevisController;
use App\Http\Controllers\Commercial\ContratImportController;

// Logistique
use App\Http\Controllers\Logistique\LogistiqueController;
use App\Http\Controllers\Logistique\ConteneurController;
use App\Http\Controllers\Logistique\NavireController;
use App\Http\Controllers\Logistique\MouvementController;
use App\Http\Controllers\Logistique\SurestarieController;

// Finance
use App\Http\Controllers\Finance\FinancierController;
use App\Http\Controllers\Finance\FactureController;

// Direction
use App\Http\Controllers\Direction\DirecteurController;

// Shared
use App\Http\Controllers\Shared\NotificationController;

// =============================================================================
// PUBLIC — no authentication required
// =============================================================================

Route::post('/login',    [AuthController::class, 'login'])->name('api.login');
Route::post('/register', [AuthController::class, 'register'])->name('api.register');
Route::post('/forgot-password', [AuthController::class, 'forgotPassword'])->name('api.forgot-password');
Route::post('/reset-password', [AuthController::class, 'resetPassword'])->name('api.reset-password');
Route::post('/contact',  [App\Http\Controllers\Public\ContactMessageController::class, 'store'])->middleware('throttle:5,1');

// =============================================================================
// PROTECTED — must be logged in
// =============================================================================

Route::middleware('auth:sanctum')->group(function () {

    // Shared — all authenticated users
    Route::get('/user',                            [AuthController::class, 'me'])->name('api.user');
    Route::post('/logout',                         [AuthController::class, 'logout'])->name('api.logout');
    Route::post('/staff/change-password',          [AuthController::class, 'changePassword'])->name('staff.change-password');
    Route::get('/notifications',                   [NotificationController::class, 'index'])->name('notifications.index');
    Route::post('/notifications/{id}/read',        [NotificationController::class, 'markRead'])->name('notifications.read');

    // Shared reference data — accessible to all authenticated roles
    Route::get('/pays', fn() => \App\Models\Pays::where('actif', true)
        ->orderBy('nom_pays')->get(['id', 'nom_pays', 'code_iso'])
    )->name('pays.index');

    // =========================================================================
    // STANDALONE CRUD — Testing routes (no role middleware)
    // Move each to the appropriate role group after validation
    // =========================================================================
    Route::apiResource('clients', \App\Http\Controllers\Client\ClientController::class);

    // =========================================================================
    // ADMIN
    // =========================================================================
    Route::middleware('role:admin')->prefix('admin')->name('admin.')->group(function () {
        Route::get('/dashboard',                   [AdminController::class, 'dashboard'])->name('dashboard');
        Route::get('/users',                        [UserController::class, 'index'])->name('users.index');
        Route::post('/users',                       [UserController::class, 'store'])->name('users.store');
        Route::put('/users/{id}',                   [UserController::class, 'update'])->name('users.update');
        Route::delete('/users/{id}',                [UserController::class, 'destroy'])->name('users.destroy');
        Route::post('/users/{id}/block',            [UserController::class, 'block'])->name('users.block');
        Route::post('/users/{id}/reset-password',   [UserController::class, 'resetPassword'])->name('users.reset-password');
        Route::get('/roles',                        [UserController::class, 'roles'])->name('roles.index');
        Route::post('/roles',                       [UserController::class, 'storeRole'])->name('roles.store');
        Route::get('/departments',                  [DepartmentController::class, 'index'])->name('departments.index');
        Route::post('/departments',                 [DepartmentController::class, 'store'])->name('departments.store');
        Route::put('/departments/{id}',             [DepartmentController::class, 'update'])->name('departments.update');
        Route::delete('/departments/{id}',          [DepartmentController::class, 'destroy'])->name('departments.destroy');
        Route::get('/positions',                    [PositionController::class, 'index'])->name('positions.index');
        Route::post('/positions',                   [PositionController::class, 'store'])->name('positions.store');
        Route::put('/positions/{id}',               [PositionController::class, 'update'])->name('positions.update');
        Route::delete('/positions/{id}',            [PositionController::class, 'destroy'])->name('positions.destroy');
        Route::get('/registrations',               [AdminController::class, 'registrations'])->name('registrations.index');
        Route::post('/registrations/{id}/approve', [AdminController::class, 'approveRegistration'])->name('registrations.approve');
        Route::post('/registrations/{id}/reject',  [AdminController::class, 'rejectRegistration'])->name('registrations.reject');
        Route::delete('/registrations/{id}',       [AdminController::class, 'destroyRegistration'])->name('registrations.destroy');
        Route::get('/audit',                       [AdminController::class, 'auditLog'])->name('audit');
        Route::get('/audit-logs/export',            [AuditController::class, 'export'])->name('audit-logs.export');
        Route::get('/audit-logs',                  [AuditController::class, 'index'])->name('audit-logs.index');
        Route::get('/config',                      [AdminController::class, 'config'])->name('config.index');
        Route::post('/config',                     [AdminController::class, 'updateConfig'])->name('config.update');
        Route::get('/system-config',               [ConfigController::class, 'index'])->name('system-config.index');
        Route::post('/system-config/{section}',    [ConfigController::class, 'update'])->name('system-config.update');

        // Currency rates
        Route::get('/currencies',                  [DeviseController::class, 'index'])->name('currencies.index');
        Route::post('/currencies/sync',            [DeviseController::class, 'sync'])->name('currencies.sync');
        Route::post('/currencies/{code}/update',   [DeviseController::class, 'updateRate'])->name('currencies.update');

        // Admin notifications
        Route::get('/notifications',               [AdminNotificationController::class, 'index'])->name('notifications.index');
        Route::get('/notifications/all',           [AdminNotificationController::class, 'all'])->name('notifications.all');
        Route::post('/notifications/read-all',     [AdminNotificationController::class, 'markAllRead'])->name('notifications.read-all');
        Route::post('/notifications/{id}/read',    [AdminNotificationController::class, 'markRead'])->name('notifications.mark-read');
        Route::delete('/notifications/read',       [AdminNotificationController::class, 'destroyRead'])->name('notifications.destroy-read');
        Route::delete('/notifications/{id}',       [AdminNotificationController::class, 'destroy'])->name('notifications.destroy');
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

        // Surestarie engine
        Route::get('/containers/{id}/surestarie',          [SurestarieController::class, 'show'])->name('containers.surestarie.show');
        Route::post('/containers/{id}/surestarie/calculer',[SurestarieController::class, 'calculer'])->name('containers.surestarie.calculer');
        Route::get('/containers/{id}/surestarie/predict',  [SurestarieController::class, 'predict'])->name('containers.surestarie.predict');
        Route::get('/surestarie/simulation',               [SurestarieController::class, 'simulation'])->name('surestarie.simulation');
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

        // Surestarie records (finance view)
        Route::get('/surestaries',                         [SurestarieController::class, 'index'])->name('surestaries.index');
        Route::get('/containers/{id}/surestarie',          [SurestarieController::class, 'show'])->name('finance.containers.surestarie.show');
        Route::post('/containers/{id}/surestarie/calculer',[SurestarieController::class, 'calculer'])->name('finance.containers.surestarie.calculer');
        Route::get('/surestarie/simulation',               [SurestarieController::class, 'simulation'])->name('finance.surestarie.simulation');
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
