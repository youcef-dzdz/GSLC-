<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use App\Http\Middleware\CheckRole;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        api: __DIR__ . '/../routes/api.php', // <-- This enables your API routes!
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // This tells Laravel to accept stateful cookies from your React SPA
        $middleware->statefulApi();

        // Add this to bypass CSRF just for API testing in Thunder Client!
        $middleware->validateCsrfTokens(except: [
            'api/*'
        ]);

        // This registers your custom CheckRole middleware to the 'role' keyword
        $middleware->alias([
            'role' => CheckRole::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();