import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, forkJoin, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

export type AppLang = 'en' | 'es' | 'fr' | 'pt';

@Injectable({ providedIn: 'root' })
export class SiteConfigService {

  private http = inject(HttpClient);

  private readonly _siteSubject = new BehaviorSubject<any | null>(null);
  public readonly site$ = this._siteSubject.asObservable();

  // private _langSubject = new BehaviorSubject<AppLang>('en');
  // readonly lang$ = this._langSubject.asObservable();


    public loadSite(langs: AppLang[]): Observable<{ pages: any[] }> {
      const uniqueLangs = Array.from(new Set(langs)); // evita duplicados por si acaso

      const requests = uniqueLangs.map((lang) =>
        this.http.get<{ pages: any[] }>(this.getURlFromLangAndContext(lang))
      );

      return forkJoin(requests).pipe(
        map((sites) => ({
          pages: sites.flatMap((s) => Array.isArray(s?.pages) ? s.pages : [])
        })),
        tap((mergedSite) => {
          this._siteSubject.next(mergedSite); // ✅ activa el observable con el site aglutinado
          // this._langSubject.next(uniqueLangs[0]); // opcional
        })
      );
    }

  private getURlFromLangAndContext(lang: AppLang): string {
    return document.location.port === '4200' ?
      'http://localhost:3000/assets/config-site/'+ lang +'/config-site.json'
      :
      '/assets/config-site/'+ lang +'/config-site.json'
  }

  public get siteSnapshot(): any | null {
    return this._siteSubject.value;
  }

  // public get langSnapshot(): AppLang {
  //   return this._langSubject.value;
  // }
}
