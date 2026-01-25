import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, forkJoin, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { AppLang } from './models/langs.model';

@Injectable({ providedIn: 'root' })
export class SiteConfigService {
  private readonly http = inject(HttpClient);
  private readonly _siteSubject = new BehaviorSubject<any | null>(null);
  public readonly site$ = this._siteSubject.asObservable();
  public configSitesByLanguage: Partial<Record<AppLang, any[]>> = {};

  public loadSite(langs: AppLang[]): Observable<{ pages: any[] }> {
    const uniqueLangs = Array.from(new Set(langs)); // evita duplicados por si acaso
    const requests = uniqueLangs.map((lang) =>
      this.http.get<{ pages: any[] }>(this.getURlFromLangAndContext(lang))
    );

    return forkJoin(requests).pipe(
      tap((sites) => {
        this.configSitesByLanguage = uniqueLangs.reduce((acc, lang, idx) => {
          const pages = Array.isArray(sites?.[idx]?.pages) ? sites[idx].pages : [];
          acc[lang] = pages;
          return acc;
        }, {} as Record<AppLang, any[]>);
      }),
      map((sites) => ({
        pages: sites.flatMap((s) => (Array.isArray(s?.pages) ? s.pages : [])),
      })),
      tap((mergedSite) => {
        this._siteSubject.next(mergedSite);
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
}
