import { Injectable } from '@angular/core';
import { UAParser } from 'ua-parser-js';

import { DeviceType } from '../enums';

@Injectable({ providedIn: 'root' })
export class DeviceInfoService {
  private readonly uaParser: UAParser;

  constructor() {
    this.uaParser = new UAParser();
  }

  /**
   * Returns the browser name identified in UserAgent string
   */
  public getBrowser(): string | undefined {
    return this.uaParser.getBrowser().name;
  }

  /**
   * Returns OS name identified in UserAgent string
   */
  public getOS(): string | undefined {
    return this.uaParser.getOS().name;
  }

  /**
   * Returns the UserAgent string parsed to UAParser.IResult object
   */
  public getDeviceInfo(): UAParser.IResult {
    return this.uaParser.getResult();
  }

  /**
   * Returns the device type stated in UserAgent string
   * @Returns console | mobile | tablet | smarttv | wearable | embedded
   */
  public getDeviceType(): string | undefined {
    return this.uaParser.getDevice().type;
  }

  /**
   * validate if device is touch
   * we take touch device as mobile and tablet,
   * then it does not ensure the true functionality of the screen
   */
  public isTouch(): boolean {
    const deviceType = this.getDeviceType();
    return deviceType === DeviceType.MOBILE || deviceType === DeviceType.TABLET;
  }
}
