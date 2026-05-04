import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { getToken, clearToken, apiClient } from '../../services/api';

// ─── Constants ────────────────────────────────────────────────────────────────
const LOGIN_TIME_KEY      = 'gslc_login_time';
const TOKEN_EXPIRY_MS     = 28_800_000; // 480 min — matches config/sanctum.php expiration
const WARNING_THRESHOLD_MS = 28_680_000; // 478 min — warn 2 minutes before expiry
const CHECK_INTERVAL_MS   = 30_000;     // tick every 30 seconds
const WARNING_SECONDS     = 120;        // countdown display starts at 2 minutes

const STAFF_PREFIXES = ['/admin', '/director', '/commercial', '/logistics', '/finance'];

function getLoginRedirect(): string {
  const path = window.location.pathname;
  return STAFF_PREFIXES.some(p => path.startsWith(p)) ? '/staff/login' : '/login';
}

// ─── Component ────────────────────────────────────────────────────────────────
export function SessionTimeoutModal() {
  const [visible, setVisible]     = useState(false);
  const [countdown, setCountdown] = useState(WARNING_SECONDS);

  const tickRef      = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Helpers ──────────────────────────────────────────────────────────────

  const stopCountdown = useCallback(() => {
    if (countdownRef.current !== null) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
  }, []);

  const handleLogout = useCallback(() => {
    // Stop all timers before navigation to avoid stale callbacks
    if (tickRef.current !== null) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
    stopCountdown();
    clearToken();
    sessionStorage.removeItem(LOGIN_TIME_KEY);
    window.location.href = getLoginRedirect();
  }, [stopCountdown]);

  const handleRefresh = useCallback(async () => {
    try {
      await apiClient.post('/api/auth/refresh');
      // Reset the login timestamp so the 8-hour window restarts
      sessionStorage.setItem(LOGIN_TIME_KEY, String(Date.now()));
      setVisible(false);
      setCountdown(WARNING_SECONDS);
    } catch {
      // Refresh failed (network error, 401, etc.) — log out gracefully
      handleLogout();
    }
  }, [handleLogout]);

  // ── Countdown display — runs every 1s while modal is visible ─────────────

  useEffect(() => {
    if (visible) {
      setCountdown(WARNING_SECONDS);
      countdownRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            stopCountdown();
            return 0;
          }
          return prev - 1;
        });
      }, 1_000);
    } else {
      stopCountdown();
    }

    return stopCountdown;
  }, [visible, stopCountdown]);

  // ── Main interval — checks elapsed time every 30 seconds ─────────────────

  useEffect(() => {
    const tick = () => {
      const token = getToken();

      // Token was cleared externally (e.g. by the 401 interceptor) — reset
      if (!token) {
        setVisible(false);
        return;
      }

      // Establish login time if not yet recorded (handles page refresh)
      let loginTimeRaw = sessionStorage.getItem(LOGIN_TIME_KEY);
      if (!loginTimeRaw) {
        const now = String(Date.now());
        sessionStorage.setItem(LOGIN_TIME_KEY, now);
        loginTimeRaw = now;
      }

      const loginTime = parseInt(loginTimeRaw, 10);
      const elapsed   = Date.now() - loginTime;

      if (elapsed >= TOKEN_EXPIRY_MS) {
        // Hard expiry — force logout immediately
        handleLogout();
        return;
      }

      if (elapsed >= WARNING_THRESHOLD_MS) {
        // Within the 2-minute warning window — show modal
        setVisible(true);
      }
    };

    // Run once immediately on mount to catch already-active sessions
    tick();

    tickRef.current = setInterval(tick, CHECK_INTERVAL_MS);

    return () => {
      if (tickRef.current !== null) {
        clearInterval(tickRef.current);
        tickRef.current = null;
      }
    };
  }, [handleLogout]);

  // ── Render ────────────────────────────────────────────────────────────────

  if (!visible) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-8">

        <h2 className="text-xl font-bold text-[#0D1F3C] mb-3">
          Session sur le point d'expirer
        </h2>

        <p className="text-gray-600 mb-2">
          Votre session expire dans 2 minutes. Souhaitez-vous continuer&nbsp;?
        </p>

        <p className="text-sm text-gray-400 mb-6">
          Temps restant&nbsp;:{' '}
          <span className="font-semibold text-[#1A4A8C]">{countdown}s</span>
        </p>

        <div className="flex gap-3 justify-end">
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Se déconnecter
          </button>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 rounded-lg bg-[#1A4A8C] text-white hover:bg-[#163d78] transition-colors"
          >
            Renouveler la session
          </button>
        </div>

      </div>
    </div>
  , document.body);
}
