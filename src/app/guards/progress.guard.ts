import { inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { BookingProgressService } from '@navigation';

@Injectable({ providedIn: 'root' })
export class ProgressGuard implements CanActivate {
  private progress = inject(BookingProgressService);
  private router = inject(Router);

  public canActivate(route: ActivatedRouteSnapshot): boolean {
    const path = route.routeConfig?.path;
    if (!path) return false;

    const allowed = this.progress.canAccess(path);
    if (!allowed) {
      this.router.navigate(['/']);
    }
    return allowed;
  }
}
