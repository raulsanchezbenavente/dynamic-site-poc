/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@angular/core';
import localforage from 'localforage';
import { defer, forkJoin, Observable } from 'rxjs';

import { RepositoryModel } from '../models/repository-model';

import { LoggerService } from './logger.service';

export const nsStore = localforage.createInstance({
  name: 'nsStore',
});

/**
 * The repository service supports storing objects using IndexedDB and can use a TTL caching strategy.
 * IBE+
 */
@Injectable({
  providedIn: 'root',
})
export class RepositoryService {
  private _ttl = 3600000; // 1 hour

  constructor(private readonly _logger: LoggerService) {}

  /**
   * Validate Cache
   * Used by config service to delete expired cache before startup
   * @returns
   */
  public validateCache(): Observable<unknown> {
    return new Observable((result) => {
      const setToDelete: string[] = [];
      defer(() =>
        nsStore.iterate((v, k) => {
          if ((v as RepositoryModel<any>).ttl < Date.now()) {
            setToDelete.push(k);
          }
        })
      ).subscribe({
        next: () => {
          if (setToDelete.length > 0) {
            const list: Observable<any>[] = [];
            for (const i of setToDelete) {
              list.push(this.removeItem(i));
            }

            forkJoin(list).subscribe(() => {
              result.next(undefined);
              result.complete();
            });
          } else {
            result.next(undefined);
            result.complete();
          }
        },
        error: (e) => {
          this._logger.error('RepositoryService', 'validateOnInit', e);
          result.next(undefined);
          result.complete();
        },
      });
    });
  }

  /**
   * Set Item from Storage
   * @param key key to store
   * @param value object to store
   * @param ttl milliseconds
   * @returns
   */
  public setItem<T>(key: string, value: T, ttl: number = this._ttl): Observable<unknown> {
    return new Observable((result) => {
      const repositoryModel: RepositoryModel<T> = {
        ttl: Date.now() + ttl,
        content: value,
      };

      defer(() => nsStore.setItem(key, repositoryModel)).subscribe({
        next: (v) => {
          result.next(undefined);
          result.complete();
        },
        error: (e) => {
          this._logger.error(RepositoryService.name, this.setItem.name, e);
          result.next(undefined);
          result.complete();
        },
      });
    });
  }

  /**
   * Get Item from Storage
   * @param key key requested
   * @returns
   */
  public getItem<T>(key: string): Observable<T> {
    return new Observable((result) => {
      defer(() => nsStore.getItem<RepositoryModel<T>>(key)).subscribe({
        next: (v) => {
          if (!v || v.ttl < Date.now()) {
            defer(() => nsStore.removeItem(key)).subscribe({
              next: (v) => {
                result.next(undefined as T);
                result.complete();
              },
              error: (e) => {
                this._logger.error(RepositoryService.name, this.getItem.name + 'remove expired item', e);
                result.next(undefined as T);
                result.complete();
              },
            });
          } else {
            result.next(v.content);
            result.complete();
          }
        },
        error: (e) => {
          this._logger.error(RepositoryService.name, this.getItem.name, e);
          result.next(undefined as T);
          result.complete();
        },
      });
    });
  }

  /**
   * Clear all items
   * @returns
   */
  public clear(): Observable<unknown> {
    return new Observable((result) => {
      defer(() => nsStore.clear()).subscribe({
        next: (v) => {
          result.next(undefined);
          result.complete();
        },
        error: (e) => {
          this._logger.error(RepositoryService.name, this.clear.name, e);
          result.next(undefined);
          result.complete();
        },
      });
    });
  }

  /**
   * Remove key
   * @param key key
   * @returns
   */
  public removeItem(key: string): Observable<unknown> {
    return new Observable((result) => {
      defer(() => nsStore.removeItem(key)).subscribe({
        next: (v) => {
          result.next(undefined);
          result.complete();
        },
        error: (e) => {
          this._logger.error(RepositoryService.name, this.removeItem.name, e);
          result.next(undefined);
          result.complete();
        },
      });
    });
  }

  /**
   * Set TTL
   *
   */
  public setTTL(ms: number): void {
    this._ttl = ms;
  }
}
