import { inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class ProgressAsynGuard implements CanActivate {
  private router = inject(Router);

  private readonly publicPaths = new Set([
    'home',
    'en/home',
    'es/inicio',
    'fr/accueil',
    'pt/casa',
    'en/members',
    'es/miembros',
    'fr/membres',
    'pt/membros',
    'en/results',
    'es/resultados',
    'fr/résultats',
    'pt/resultados',
    'en/personal-data',
    'es/datos-personales',
    'fr/donnees-personnelles',
    'pt/dados-pessoais',
    'en/extras',
    'es/extras',
    'fr/extras',
    'pt/extras',
    'en/payment',
    'es/pago',
    'fr/paiement',
    'pt/pagamento',
    'en/thanks',
    'es/gracias',
    'fr/merci',
    'pt/obrigado',
    'en/check-in/dangerous-goods',
    'es/check-in/articulos-peligrosos',
    'fr/check-in/articles-dangereux',
    'pt/check-in/artigos-perigosos',
  ]);

  public async canActivate(route: ActivatedRouteSnapshot): Promise<boolean> {
    const path = route.routeConfig?.path;
    const token = localStorage.getItem('BOOKING_PROCESS');

    return true;

    if (path && this.publicPaths.has(path as string)) {
      return true;
    }

    if (!path || !token) {
      this.router.navigate(['/']);
      return false;
    }

    try {
      const response = await fetch(`http://localhost:3000/allowAccess/${path}`, {
        headers: {
          Authorization: token ?? '',
        },
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
      console.warn('Access denied or server error', err);
      this.router.navigate(['/']);
      return true;
      return false;
    }
  }
}
