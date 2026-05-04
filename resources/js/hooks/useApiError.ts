import { AxiosError } from 'axios';

interface ApiErrorShape {
  message?: string;
  errors?: Record<string, string[]>;
  retry_after?: number;
}

/**
 * Extracts a safe, user-facing error message from an Axios error.
 * Never exposes stack traces, internal Laravel errors, or raw server output.
 *
 * Usage:
 *   const { getErrorMessage, getFieldErrors } = useApiError();
 *   catch (err) { toast.error(getErrorMessage(err)); }
 */
export function useApiError() {
  function getErrorMessage(error: unknown): string {
    if (error instanceof AxiosError) {
      const status = error.response?.status;
      const data = error.response?.data as ApiErrorShape | undefined;

      if (status === 429) {
        const minutes = data?.retry_after
          ? Math.ceil(data.retry_after / 60)
          : 15;
        return `Trop de tentatives. Réessayez dans ${minutes} minute(s).`;
      }
      if (status === 401) return 'Session expirée. Veuillez vous reconnecter.';
      if (status === 403) return 'Accès refusé.';
      if (status === 422 && data?.errors) {
        // Return first validation error found
        const first = Object.values(data.errors)[0];
        return Array.isArray(first) ? first[0] : 'Erreur de validation.';
      }
      if (status === 422 && data?.message) return data.message;
      if (status && status >= 500) return 'Erreur serveur. Veuillez réessayer.';
      if (data?.message) return data.message;
    }
    return 'Une erreur inattendue est survenue.';
  }

  function getFieldErrors(error: unknown): Record<string, string> {
    if (error instanceof AxiosError) {
      const data = error.response?.data as ApiErrorShape | undefined;
      if (data?.errors) {
        return Object.fromEntries(
          Object.entries(data.errors).map(([k, v]) => [k, v[0]])
        );
      }
    }
    return {};
  }

  return { getErrorMessage, getFieldErrors };
}
