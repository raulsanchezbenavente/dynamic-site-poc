import { inject, Injectable } from '@angular/core';
import { CarrierDTO, RepositoryResourcesService } from '@dcx/ui/api-layer';
import { CarrierVM, CultureServiceEx, LoggerService, RepositoryService } from '@dcx/ui/libs';
import { catchError, map, Observable, of, switchMap, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CarriersRepositoryService {
  private readonly repositoryService = inject(RepositoryService);
  private readonly repositoryResources = inject(RepositoryResourcesService);
  private readonly cultureService = inject(CultureServiceEx);
  private readonly logger = inject(LoggerService);

  private readonly CACHE_KEY_PREFIX = 'carriers';

  /**
   * Checks if carriers are loaded in IndexedDB for the specified culture.
   * This method should be called in the parent component
   * during initialization if carriers need to be preloaded.
   *
   * @param culture - Culture code (e.g., 'en-US', 'es-CO'). If not specified, uses the current culture
   * @returns Observable<void> - Completes when carriers are loaded or on error
   *
   */
  public ensureCarriersAreLoaded(culture?: string): Observable<void> {
    const cultureCode = culture || this.cultureService.getCulture();
    const cacheKey = this.getCacheKey(cultureCode);
    this.logger.info('CarriersRepositoryService', 'loadCarriers', `Loading carriers for culture: ${cultureCode}`);
    return this.repositoryService.getItem<CarrierDTO[]>(cacheKey).pipe(
      switchMap((cachedData) => {
        if (cachedData?.length) {
          this.logger.info(
            'CarriersRepositoryService',
            'loadCarriers',
            `Carriers loaded from cache for culture: ${cultureCode}`
          );
          return of(void 0);
        }
        this.logger.info(
          'CarriersRepositoryService',
          'loadCarriers',
          `No cached carriers found for culture: ${cultureCode}, fetching from API`
        );
        return this.loadAndCacheCarriers(cultureCode);
      }),
      catchError((error) => {
        this.logger.error('[CarriersRepository]', `Error en ensureCarriersLoaded: ${error}`);
        return of(void 0);
      })
    );
  }

  /**
   * Gets carriers from IndexedDB mapped to CarrierVM objects.
   *
   * @param culture - Culture code (optional)
   * @returns Observable<Map<string, Carrier>> - Map of carrier code to Carrier object
   *
   */
  public getCarriers(culture?: string): Observable<CarrierDTO[]> {
    const cultureCode = culture || this.cultureService.getCulture();
    const cacheKey = this.getCacheKey(cultureCode);

    return this.repositoryService.getItem<CarrierDTO[]>(cacheKey).pipe(
      map((cachedData) => {
        if (!cachedData?.length) {
          this.logger.warn(
            'CarriersRepositoryService',
            'getCarriers',
            `No carriers found in cache for culture: ${cultureCode}`
          );
          return [];
        }

        return cachedData.map(
          (carrier) =>
            ({
              name: carrier.name,
              code: carrier.code,
              externalUrl: carrier.externalUrl,
              logo: carrier.logo,
            }) as CarrierVM
        );
      }),
      catchError((error) => {
        this.logger.error(
          'CarriersRepositoryService',
          'getCarriers',
          `Error retrieving carriers from cache for culture: ${cultureCode} - ${error}`
        );
        return of([]);
      })
    );
  }

  /**
   * Loads carriers from the API and caches them in IndexedDB.
   */
  private loadAndCacheCarriers(culture: string): Observable<void> {
    this.logger.info(
      'CarriersRepositoryService',
      'loadAndCacheCarriers',
      `Fetching carriers from API for culture: ${culture}`
    );

    return this.repositoryResources.getResource<CarrierDTO>('carriers', { culture }).pipe(
      switchMap((envelope) => {
        const carriers = envelope.data;
        const cacheKey = this.getCacheKey(culture);
        return this.repositoryService.setItem(cacheKey, carriers).pipe(
          tap(() => {
            this.logger.info(
              'CarriersRepositoryService',
              'loadAndCacheCarriers',
              `Carriers cached successfully for culture: ${culture}`
            );
          }),
          map(() => void 0)
        );
      }),
      catchError((error) => {
        this.logger.error(
          'CarriersRepositoryService',
          'loadAndCacheCarriers',
          `Error fetching or caching carriers for culture: ${culture} - ${error}`
        );
        return of(void 0);
      })
    );
  }

  /**
   * Generates cache key for IndexedDB.
   */
  private getCacheKey(culture: string): string {
    return `${this.CACHE_KEY_PREFIX}_${culture.toLowerCase()}`;
  }
}
