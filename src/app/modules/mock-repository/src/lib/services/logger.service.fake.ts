// tslint:disable: no-any no-console

export class LoggerServiceFake {
  public info(className: string, message: string, detail?: any): void {
    console.info(`${className} - ${message}`, detail);
  }

  public warn(className: string, message: string, detail?: any): void {
    // Suppress ComposerService warnings about unknown id register in Storybook
    // This is expected since components are not registered via CMS in Storybook context
    if (className.includes('ComposerService') && message.includes('unknown id register')) {
      return;
    }
    console.warn(`${className} - ${message}`, detail);
  }

  public error(className: string, message: string, detail?: any): void {
    console.error(`${className} - ${message}`, detail);
  }
}
