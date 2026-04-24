import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { IdleTimeoutService } from '../services';

/**
 * HTTP interceptor that resets the idle timeout timers on each request.
 *
 * This interceptor detects any HTTP activity from the user and resets both the alert
 * and expiration timers managed by IdleTimeoutService. This prevents the timeout warning
 * modal from appearing and the session from expiring while the user is actively making
 * requests to the server.
 *
 * The timeout system has two stages:
 * - First timer: Shows a warning modal to the user
 * - Second timer: Redirects the user if no activity is detected
 *
 * Any HTTP request resets both timers, ensuring continuous user activity is tracked.
 */
@Injectable({ providedIn: 'root' })
export class TimeOutInterceptor implements HttpInterceptor {
  private readonly idleTimeoutSvc = inject(IdleTimeoutService);

  constructor() {}

  /**
   * Intercepts all outgoing HTTP requests and resets the idle timeout timers.
   *
   * @param req - The outgoing HTTP request
   * @param next - The next handler in the interceptor chain
   * @returns Observable of the HTTP event
   */
  public intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    this.idleTimeoutSvc.resetTimer();
    return next.handle(req);
  }
}
