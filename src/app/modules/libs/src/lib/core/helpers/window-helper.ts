export class WindowHelper {
  public static getLocation(): Location {
    return globalThis.location;
  }

  public static getPath(): string {
    return globalThis.location.pathname;
  }
}
