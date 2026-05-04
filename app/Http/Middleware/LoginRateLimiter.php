<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\RateLimiter;
use App\Mail\SuspiciousLoginAlert;
use Illuminate\Support\Facades\Mail;

class LoginRateLimiter
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $key = 'login|' . $request->ip();

        RateLimiter::hit($key, 900); // 15 mins block

        $attempts = RateLimiter::attempts($key);
        if ($attempts >= 10) {
            Mail::to(
                config('mail.admin_address', config('mail.from.address'))
            )->queue(new SuspiciousLoginAlert(
                $request->ip(),
                $attempts,
                $request->input('email', 'unknown')
            ));
        }

        if (RateLimiter::tooManyAttempts($key, 5)) {
            return response()->json([
                'message' => 'Trop de tentatives. Réessayez dans 15 minutes.',
                'retry_after' => RateLimiter::availableIn($key)
            ], 429);
        }

        $response = $next($request);

        // If login successful, clear the rate limiter
        if ($response->getStatusCode() === 200) {
            RateLimiter::clear($key);
        }

        return $response;
    }
}
