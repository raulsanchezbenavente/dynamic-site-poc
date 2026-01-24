import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

export type AppLang = 'en' | 'es' | 'fr' | 'pt';

@Injectable({ providedIn: 'root' })
export class SiteConfigService {

  private http = inject(HttpClient);

  private _siteSubject = new BehaviorSubject<any | null>(null);
  site$ = this._siteSubject.asObservable();

  private _langSubject = new BehaviorSubject<AppLang>('en');
  readonly lang$ = this._langSubject.asObservable();

  // public load(): Observable<any> {
  //   return this.http.get<any>(this.getURlFromLangAndContext('en')).pipe(
  //     tap((site) => this._siteSubject.next(site))
  //   );
  // }

  public loadSite(lang: AppLang): Observable<any> {
    const url = this.getURlFromLangAndContext(lang);

    return this.http.get<any>(url).pipe(
      tap((site) => {
        this._langSubject.next(lang);
        this._siteSubject.next(site);
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

  public get langSnapshot(): AppLang {
    return this._langSubject.value;
  }
}
