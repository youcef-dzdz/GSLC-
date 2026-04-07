<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Blade\BladeAuthController;
use App\Http\Controllers\Blade\BladeAdminController;
use App\Http\Controllers\Blade\BladeCommercialController;
use App\Http\Controllers\Blade\BladeLogistiqueController;
use App\Http\Controllers\Blade\BladeFinanceController;
use App\Http\Controllers\Blade\BladeDirectionController;
use App\Http\Controllers\Blade\BladeClientPortalController;

// ── Public auth routes ───────────────────────────────────────
Route::get('/login',         [BladeAuthController::class, 'showClientLogin'])->name('client.login');
Route::post('/login',        [BladeAuthController::class, 'clientLogin'])->name('client.login.post');
Route::get('/register',      [BladeAuthController::class, 'showRegister'])->name('client.register');
Route::post('/register',     [BladeAuthController::class, 'register'])->name('client.register.post');
Route::get('/staff/login',   [BladeAuthController::class, 'showStaffLogin'])->name('staff.login');
Route::post('/staff/login',  [BladeAuthController::class, 'staffLogin'])->name('staff.login.post');
Route::post('/blade/logout', [BladeAuthController::class, 'logout'])->middleware('auth')->name('blade.logout');
Route::post('/blade/lang',   [BladeAuthController::class, 'setLanguage'])->name('blade.lang');

// ── Client password reset ─────────────────────────────────────
Route::get('/forgot-password',        [BladeAuthController::class, 'showClientForgotPassword'])->name('client.password.request');
Route::post('/forgot-password',       [BladeAuthController::class, 'sendClientResetLink'])->name('client.password.email');
Route::get('/reset-password/{token}', [BladeAuthController::class, 'showClientResetForm'])->name('client.password.reset');
Route::post('/reset-password',        [BladeAuthController::class, 'resetClientPassword'])->name('client.password.update');

// ── Staff password reset ──────────────────────────────────────
Route::get('/staff/forgot-password',        [BladeAuthController::class, 'showStaffForgotPassword'])->name('staff.password.request');
Route::post('/staff/forgot-password',       [BladeAuthController::class, 'sendStaffResetLink'])->name('staff.password.email');
Route::get('/staff/reset-password/{token}', [BladeAuthController::class, 'showStaffResetForm'])->name('staff.password.reset');
Route::post('/staff/reset-password',        [BladeAuthController::class, 'resetStaffPassword'])->name('staff.password.update');

// ── Staff Blade routes ────────────────────────────────────────
Route::middleware(['auth', 'blade.auth'])->prefix('blade')->name('blade.')->group(function () {

    // Admin
    Route::middleware('blade.role:admin')->prefix('admin')->name('admin.')->group(function () {
        Route::get('/dashboard',                    [BladeAdminController::class, 'dashboard'])->name('dashboard');
        Route::get('/users',                        [BladeAdminController::class, 'users'])->name('users');
        Route::get('/users/create',                 [BladeAdminController::class, 'createUser'])->name('users.create');
        Route::post('/users',                       [BladeAdminController::class, 'storeUser'])->name('users.store');
        Route::get('/users/{id}/edit',              [BladeAdminController::class, 'editUser'])->name('users.edit');
        Route::put('/users/{id}',                   [BladeAdminController::class, 'updateUser'])->name('users.update');
        Route::post('/users/{id}/block',            [BladeAdminController::class, 'blockUser'])->name('users.block');
        Route::get('/users/{id}/permissions',       [BladeAdminController::class, 'permissions'])->name('users.permissions');
        Route::post('/users/{id}/permissions',      [BladeAdminController::class, 'savePermissions'])->name('users.permissions.save');
        Route::get('/registrations',                [BladeAdminController::class, 'registrations'])->name('registrations');
        Route::post('/registrations/{id}/approve',  [BladeAdminController::class, 'approveRegistration'])->name('registrations.approve');
        Route::post('/registrations/{id}/reject',   [BladeAdminController::class, 'rejectRegistration'])->name('registrations.reject');
        Route::get('/audit',                        [BladeAdminController::class, 'audit'])->name('audit');
        Route::get('/config',                       [BladeAdminController::class, 'config'])->name('config');
    });

    // Commercial
    Route::middleware('blade.role:commercial')->prefix('commercial')->name('commercial.')->group(function () {
        Route::get('/dashboard',          [BladeCommercialController::class, 'dashboard'])->name('dashboard');
        Route::get('/clients',            [BladeCommercialController::class, 'clients'])->name('clients');
        Route::get('/clients/create',     [BladeCommercialController::class, 'createClient'])->name('clients.create');
        Route::post('/clients',           [BladeCommercialController::class, 'storeClient'])->name('clients.store');
        Route::get('/clients/{id}',       [BladeCommercialController::class, 'showClient'])->name('clients.show');
        Route::get('/clients/{id}/edit',  [BladeCommercialController::class, 'editClient'])->name('clients.edit');
        Route::put('/clients/{id}',       [BladeCommercialController::class, 'updateClient'])->name('clients.update');
        Route::delete('/clients/{id}',    [BladeCommercialController::class, 'destroyClient'])->name('clients.destroy')->middleware('blade.permission:clients.delete');
        Route::get('/demands',            [BladeCommercialController::class, 'demands'])->name('demands');
        Route::get('/demands/{id}',       [BladeCommercialController::class, 'showDemand'])->name('demands.show');
        Route::get('/quotes',             [BladeCommercialController::class, 'quotes'])->name('quotes');
        Route::get('/quotes/create',      [BladeCommercialController::class, 'createQuote'])->name('quotes.create');
        Route::post('/quotes',            [BladeCommercialController::class, 'storeQuote'])->name('quotes.store');
        Route::get('/quotes/{id}',        [BladeCommercialController::class, 'showQuote'])->name('quotes.show');
        Route::get('/contracts',          [BladeCommercialController::class, 'contracts'])->name('contracts');
        Route::get('/contracts/{id}',     [BladeCommercialController::class, 'showContract'])->name('contracts.show');
        Route::get('/vessels',            [BladeCommercialController::class, 'vessels'])->name('vessels');
        Route::get('/vessels/create',     [BladeCommercialController::class, 'createVessel'])->name('vessels.create');
        Route::post('/vessels',           [BladeCommercialController::class, 'storeVessel'])->name('vessels.store');
        Route::get('/vessels/{id}/edit',  [BladeCommercialController::class, 'editVessel'])->name('vessels.edit');
        Route::put('/vessels/{id}',       [BladeCommercialController::class, 'updateVessel'])->name('vessels.update');
        Route::delete('/vessels/{id}',    [BladeCommercialController::class, 'destroyVessel'])->name('vessels.destroy');
    });

    // Logistique
    Route::middleware('blade.role:logistique')->prefix('logistique')->name('logistique.')->group(function () {
        Route::get('/dashboard',                 [BladeLogistiqueController::class, 'dashboard'])->name('dashboard');
        Route::get('/containers',                [BladeLogistiqueController::class, 'containers'])->name('containers');
        Route::get('/containers/{id}',           [BladeLogistiqueController::class, 'showContainer'])->name('containers.show');
        Route::post('/containers/{id}/status',   [BladeLogistiqueController::class, 'transitionStatus'])->name('containers.transition')->middleware('blade.permission:containers.transition');
        Route::get('/movements',                 [BladeLogistiqueController::class, 'movements'])->name('movements');
        Route::get('/warehouse',                 [BladeLogistiqueController::class, 'warehouse'])->name('warehouse');
    });

    // Finance
    Route::middleware('blade.role:financier')->prefix('finance')->name('finance.')->group(function () {
        Route::get('/dashboard',               [BladeFinanceController::class, 'dashboard'])->name('dashboard');
        Route::get('/invoices',                [BladeFinanceController::class, 'invoices'])->name('invoices');
        Route::get('/invoices/{id}',           [BladeFinanceController::class, 'showInvoice'])->name('invoices.show');
        Route::post('/invoices/{id}/emit',     [BladeFinanceController::class, 'emitInvoice'])->name('invoices.emit')->middleware('blade.permission:invoices.emit');
        Route::get('/invoices/{id}/pdf',       [BladeFinanceController::class, 'downloadPdf'])->name('invoices.pdf');
        Route::get('/payments',                [BladeFinanceController::class, 'payments'])->name('payments');
    });

    // Direction (admin can also access)
    Route::prefix('direction')->name('direction.')->group(function () {
        Route::get('/dashboard',                 [BladeDirectionController::class, 'dashboard'])->name('dashboard');
        Route::get('/contracts',                 [BladeDirectionController::class, 'contracts'])->name('contracts');
        Route::post('/contracts/{id}/approve',   [BladeDirectionController::class, 'approveContract'])->name('contracts.approve');
        Route::post('/contracts/{id}/return',    [BladeDirectionController::class, 'returnContract'])->name('contracts.return');
        Route::get('/reports',                   [BladeDirectionController::class, 'reports'])->name('reports');
    });
});

// ── Client Portal routes ──────────────────────────────────────
Route::middleware(['auth', 'blade.auth', 'client.portal'])->prefix('client')->name('client.')->group(function () {
    Route::get('/dashboard',            [BladeClientPortalController::class, 'dashboard'])->name('dashboard');
    Route::get('/demands',              [BladeClientPortalController::class, 'demands'])->name('demands');
    Route::get('/demands/create',       [BladeClientPortalController::class, 'createDemand'])->name('demands.create');
    Route::post('/demands',             [BladeClientPortalController::class, 'storeDemand'])->name('demands.store');
    Route::get('/demands/{id}',         [BladeClientPortalController::class, 'showDemand'])->name('demands.show');
    Route::get('/quotes',               [BladeClientPortalController::class, 'quotes'])->name('quotes');
    Route::get('/quotes/{id}',          [BladeClientPortalController::class, 'showQuote'])->name('quotes.show');
    Route::post('/quotes/{id}/accept',  [BladeClientPortalController::class, 'acceptQuote'])->name('quotes.accept');
    Route::post('/quotes/{id}/reject',  [BladeClientPortalController::class, 'rejectQuote'])->name('quotes.reject');
    Route::get('/contracts',            [BladeClientPortalController::class, 'contracts'])->name('contracts');
    Route::get('/contracts/{id}',       [BladeClientPortalController::class, 'showContract'])->name('contracts.show');
    Route::get('/invoices',             [BladeClientPortalController::class, 'invoices'])->name('invoices');
    Route::get('/invoices/{id}/pdf',    [BladeClientPortalController::class, 'downloadInvoice'])->name('invoices.pdf');
    Route::get('/containers',           [BladeClientPortalController::class, 'containers'])->name('containers');
});

// ── React SPA — MUST BE LAST ──────────────────────────────────
Route::get('/{any}', function () {
    return view('welcome');
})->where('any', '.*');
