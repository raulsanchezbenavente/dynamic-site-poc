export class BoardingPassBaseStrategy {
  protected handleAnchor(fileUrl: string, fileName: string): void {
    const anchor = document.createElement('a');
    anchor.href = fileUrl;
    anchor.download = fileName;
    this.simulateClickOnAnchor(anchor);
  }

  /**
   * Execute a click on the anchor element to force the download. This method is extracted for testability
   * @param anchor Anchor element
   */
  protected simulateClickOnAnchor(anchor: HTMLAnchorElement): void {
    anchor.click();
  }
}
