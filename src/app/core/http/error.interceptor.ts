import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { AuthService } from '../auth/auth.service';
import { ProblemDetails } from '../models/paging.models';

/**
 * Surfaces server errors via a snackbar and forces logout on 401.
 * Components can still subscribe to error() / catchError for inline handling;
 * this interceptor only provides the default UX safety net.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const snackbar = inject(MatSnackBar);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401 && !req.url.endsWith('/auth/login')) {
        auth.logout(false);
        void router.navigate(['/login'], { queryParams: { reason: 'expired' } });
      }

      if (err.status === 403) {
        snackbar.open(
          "Your role doesn't permit this action.",
          'Dismiss',
          { duration: 5000, panelClass: 'snackbar-error' },
        );
      }

      const message = extractMessage(err);
      // 409 Conflict carries a meaningful business reason (e.g. "customer has active
      // sales" or "email already exists") that the user must see. Forms still get the
      // raw error via subscribe() if they want inline handling.
      if (err.status === 409) {
        snackbar.open(message, 'Dismiss', { duration: 6000, panelClass: 'snackbar-error' });
      }
      if (err.status >= 500 || err.status === 0) {
        snackbar.open(message, 'Dismiss', { duration: 6000, panelClass: 'snackbar-error' });
      }
      return throwError(() => err);
    }),
  );
};

function extractMessage(err: HttpErrorResponse): string {
  if (err.status === 0) {
    return 'Cannot reach the server. Check that the API is running.';
  }
  const problem = err.error as ProblemDetails | undefined;
  if (problem?.detail) {
    return problem.detail;
  }
  if (problem?.title) {
    return problem.title;
  }
  return err.message || 'Unexpected error.';
}
