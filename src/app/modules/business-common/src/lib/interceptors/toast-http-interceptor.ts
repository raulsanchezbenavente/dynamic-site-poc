import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ToastService } from '@dcx/ui/design-system';
import { Observable, tap } from 'rxjs';

import { ToastRequestConfigsService } from './configs/toast-interceptor.configs';
import { HttpInterceptorToastModel } from './models/http-interceptor-toast/http-interceptor-toast.model';

@Injectable({ providedIn: 'root' })
export class ToastHttpInterceptor implements HttpInterceptor {
  private readonly toastService = inject(ToastService);
  private readonly configToast = inject(ToastRequestConfigsService);

  constructor() {}

  public intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let container: string = '';
    const path: string = this.stripHostAndParams(request.url);
    const method: string = request.method;
    const found = this.getRequestToasterConfig(path, method);

    if (found) {
      if (typeof found.container === 'string') {
        container = found.container;
      }
      if (typeof found.container === 'function') {
        console.log('request');
        console.log(request);

        container = found.container(request);
      }
    }

    return next.handle(request).pipe(
      tap({
        next: (event) => {
          if (event instanceof HttpResponse && found) {
            this.toastService.show(found.config, container);
          }
        },
        error: (err) => {
          if (found?.configError) {
            this.toastService.show(found.configError, container);
          }
        },
      })
    );
  }

  private getRequestToasterConfig(path: string, method: string): HttpInterceptorToastModel | undefined {
    return this.configToast.configs.find(
      (item) => item.method.toUpperCase() === method.toUpperCase() && item.path === path
    );
  }

  private stripHostAndParams(url: string): string {
    try {
      const u = new URL(url);
      return u.pathname.startsWith('/') ? u.pathname.slice(1) : u.pathname;
    } catch {
      return url;
    }
  }
}
