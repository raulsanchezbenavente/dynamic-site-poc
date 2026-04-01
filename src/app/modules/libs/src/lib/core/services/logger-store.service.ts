import { Injectable } from '@angular/core';
import localforage from 'localforage';
import { v4 as uuidv4 } from 'uuid';

import { LogItem } from '../models/logger/log-item';

export const logStore = localforage.createInstance({
  name: 'logStore',
});

/**
 * Logger Store Service allows store events on IndexedDB
 * IBE+
 */
@Injectable({
  providedIn: 'root',
})
export class LoggerStoreService {
  /**
   * Set Default TTL to 24 hours
   */
  private readonly _logTTL = 86400000;

  constructor() {
    this.cleanLogStore();
  }

  /**
   * Store Log onIndexedDB
   * @param log log record
   */
  storeLog(log: LogItem) {
    logStore.setItem(Date.now().toString() + '_' + uuidv4(), log);
  }

  /**
   * Clean Old Records
   */
  cleanLogStore() {
    logStore.keys((x, y) => {
      for (const key of y) {
        const ttl = key.split('_');
        if (+ttl[0] < Date.now() - this._logTTL) {
          logStore.removeItem(key);
        }
      }
    });
  }
}
