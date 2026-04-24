import { Injectable } from '@angular/core';
import { from, Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class SlugCultureControlService {
  private readonly endpointGetTitleTab: string = '/configuration/api/v1/UI_PLUS/MultiTab/GetTabsTranslations';

  private isActiveTabParamPresent(searchParams: string): boolean {
    return searchParams.includes('activeTab');
  }

  public getFixedParameters(nextLang: string): Observable<string> {
    const searchParams: string = document.location.search;
    if (this.isActiveTabParamPresent(searchParams)) {
      return this.getActiveTabModification(nextLang, searchParams);
    } else {
      return of(searchParams);
    }
  }

  private getActiveTabModification(nextLang: string, searchParams: string): Observable<string> {
    const currentLang = this.getLangFromURL();
    const currentActiveTab = this.getActiveTabTextFromURL(searchParams) ?? '';
    const url =
      `${this.endpointGetTitleTab}` +
      `?nodeName=Members` +
      `&currentLang=${encodeURIComponent(currentLang)}` +
      `&nextLang=${encodeURIComponent(nextLang)}` +
      `&activeTab=${encodeURIComponent(currentActiveTab)}`;

    return from(fetch(url)).pipe(
      switchMap((res) => from(res.json() as Promise<{ translatedTabTitle?: string }>)),
      map((data) => {
        return data.translatedTabTitle
          ? this.getSearchWithActiveTab(data.translatedTabTitle, searchParams)
          : searchParams;
      }),
      catchError((error) => {
        console.error('Error fetching active tab translation:', error);
        return of(searchParams);
      })
    );
  }

  private getSearchWithActiveTab(newValue: string, searchParams: string): string {
    const params = new URLSearchParams(searchParams);
    if (params.has('activeTab')) {
      params.set('activeTab', newValue);
    }
    return `?${params.toString()}`;
  }

  private getActiveTabTextFromURL(searchParams: string): string | null {
    const urlParams = new URLSearchParams(searchParams);
    return urlParams.get('activeTab');
  }

  private getLangFromURL(): string {
    const url = globalThis.location.pathname;
    const segments = url.split('/').filter((segment) => segment.length > 0);
    if (segments.length === 0) {
      return 'en';
    }
    if (segments[0].length === 2) {
      return segments[0];
    }
    return segments[1] ?? 'en';
  }
}
