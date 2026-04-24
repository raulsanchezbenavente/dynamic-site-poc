/* eslint-disable consistent-return */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@angular/core';

import { LogItem } from '../models/logger/log-item';
import { LogTypeEnum } from '../models/logger/log-type.enum';

import { LoggerStoreService } from './logger-store.service';

/**
 * Logger Service allow register events from app components and other services.
 * IBE+
 */
@Injectable({
  providedIn: 'root',
})
export class LoggerService {
  private readonly _loggerNotifierChannel = new BroadcastChannel('IBELoggerChannel');
  private readonly _loggerListenerChannel = new BroadcastChannel('IBELoggerChannel');
  private _visibleLogs = false;

  constructor(private readonly _loggerStore: LoggerStoreService) {
    this.initLoggerChannel();
  }

  /**
   * Enable Visible Logs
   * @param value
   */
  public enableLogs(value: boolean) {
    this._visibleLogs = value;
  }

  /**
   * Info Level
   * @param className class name message source
   * @param message custom message
   * @param detail detail / object - optional
   * @returns
   */
  public info(className: string, message: string, detail: any = {}): void {
    const logItem: LogItem = { type: LogTypeEnum.INFO, className: className, message: message, detail: detail };
    this.sendLogItem(logItem);
  }

  /**
   * Warn Level
   * @param className class name message source
   * @param message custom message
   * @param detail detail / object - optional
   * @returns
   */
  public warn(className: string, message: string, detail: any = {}): void {
    const logItem: LogItem = { type: LogTypeEnum.WARN, className: className, message: message, detail: detail };
    this.sendLogItem(logItem);
  }

  /**
   * Error level
   * @param className class name message source
   * @param message custom message
   * @param detail detail / object - optional
   * @returns
   */
  public error(className: string, message: string, detail: any = {}): void {
    const logItem: LogItem = { type: LogTypeEnum.ERROR, className: className, message: message, detail: detail };
    this.sendLogItem(logItem);
  }

  /**
   * Send Log item using notifier channel
   * @param logItem
   */
  private sendLogItem(logItem: LogItem): void {
    this._loggerNotifierChannel.postMessage(JSON.parse(this.stringify(logItem)));
  }

  /**
   * Private InitLogger Channel
   */
  private initLoggerChannel(): void {
    this._loggerListenerChannel.onmessage = (event) => {
      this.printLog(event.data as LogItem);
    };
  }

  /**
   * Print Logs
   * @param logItem
   */
  private printLog(logItem: LogItem) {
    // Store Log
    this._loggerStore.storeLog(logItem);

    // Validate if log should be printed
    if (this._visibleLogs) {
      switch (logItem.type) {
        case LogTypeEnum.INFO:
          console.info('%c' + logItem.className + ' - ' + logItem.message, 'color: #6495ED', logItem.detail);
          break;
        case LogTypeEnum.WARN:
          console.warn('%c' + logItem.className + ' - ' + logItem.message, 'color: #FF8C00', logItem.detail);
          break;
        case LogTypeEnum.ERROR:
          console.error('%c' + logItem.className + ' - ' + logItem.message, 'color: #DC143C', logItem.detail);
          break;
        default:
          console.info(
            '%c' + LogTypeEnum.UNDEFINED + logItem.className + ' - ' + logItem.message,
            'color: #677999',
            logItem.detail
          );
          break;
      }
    }
  }

  /**
   * Stringify Object to remove circular dependencies.
   * @param obj
   * @returns
   */
  private stringify(obj: any): string {
    let cache: any = [];
    const str = JSON.stringify(obj, function (key, value) {
      if (typeof value === 'object' && value !== null) {
        if (cache.includes(value)) {
          // Circular reference found, discard key
          return;
        }
        // Store value in our collection
        cache.push(value);
      }
      return value;
    });
    cache = null; // reset the cache
    return str;
  }
}
