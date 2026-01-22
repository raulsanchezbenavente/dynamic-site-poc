import { inject, Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class ProgressAsynGuard implements CanActivate {
    private router = inject(Router);

    async canActivate(route: ActivatedRouteSnapshot): Promise<boolean> {
        const path = route.routeConfig?.path;
        const token = localStorage.getItem('BOOKING_PROCESS');

        if (path === 'home' || path === 'avianca-home') {
            return true;
        }

        if (!path || !token) {
            this.router.navigate(['/']);
            return false;
        }

        try {
            const response = await fetch(`http://localhost:3000/allowAccess/${path}`, {
                headers: {
                    Authorization: token
                }
            });
            if (response.status !== 200) throw new Error();
            const data = await response.json();
            if (data.allowed) {
                return true;
            } else {
                this.router.navigate(['/' + (data.redirectTo || 'home')]);
                return false;
            }
        } catch (err) {
            localStorage.removeItem('BOOKING_PROCESS');
            console.warn('Access denied or server error');
            this.router.navigate(['/']);
            return false;
        }
    }
}
