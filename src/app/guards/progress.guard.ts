import { inject, Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { BookingProgressService } from '../services/booking-progress/booking-progress.service';

@Injectable({ providedIn: 'root' })
export class ProgressGuard implements CanActivate {
    private progress = inject(BookingProgressService);
    private router = inject(Router);

    canActivate(route: ActivatedRouteSnapshot): boolean {
        const path = route.routeConfig?.path;
        if (!path) return false;

        const allowed = this.progress.canAccess(path);
        if (!allowed) {
            this.router.navigate(['/']);
        }
        return allowed;
    }
}
