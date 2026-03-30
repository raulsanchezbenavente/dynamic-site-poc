import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoggerService {
  public info(className: string, message: string, detail: any = {}): void {
    console.info(`${className} - ${message}`, detail);
  }

  public warn(className: string, message: string, detail: any = {}): void {
    console.warn(`${className} - ${message}`, detail);
  }

  public error(className: string, message: string, detail: any = {}): void {
    console.error(`${className} - ${message}`, detail);
  }
}
