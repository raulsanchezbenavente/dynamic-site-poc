import { WindowHelper } from "../../core/helpers/window-helper";
import { ExternalLinkPipe } from "./external-link.pipe";


describe('IsExternalLinkPipe', () => {
  let pipe: ExternalLinkPipe;

  beforeEach(() => {
    pipe = new ExternalLinkPipe();

    spyOn(WindowHelper, 'getLocation').and.returnValue({
      href: 'https://example.com/page',
      hostname: 'example.com'
    } as Location);
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return false for null input', () => {
    expect(pipe.transform(null)).toBeFalse();
  });

  it('should return false for undefined input', () => {
    expect(pipe.transform(undefined)).toBeFalse();
  });

  it('should return false for non-string input', () => {
    // @ts-ignore
    expect(pipe.transform(123)).toBeFalse();
  });

  it('should return false for relative URLs (same domain)', () => {
    expect(pipe.transform('/some-page')).toBeFalse();
  });

  it('should return false for absolute URLs on the same domain', () => {
    expect(pipe.transform('https://example.com/another-page')).toBeFalse();
  });

  it('should return true for absolute URLs on a different domain', () => {
    expect(pipe.transform('https://different-domain.com/page')).toBeTrue();
  });

  it('should return true for a different subdomain', () => {
    expect(pipe.transform('https://subdomain.example.com/page')).toBeTrue();
  });

  it('should handle URLs with query parameters correctly', () => {
    expect(pipe.transform('https://example.com/page?param=value')).toBeFalse();
    expect(pipe.transform('https://different.com/page?param=value')).toBeTrue();
  });

  it('should handle URLs with hash fragments correctly', () => {
    expect(pipe.transform('https://example.com/page#section')).toBeFalse();
    expect(pipe.transform('https://different.com/page#section')).toBeTrue();
  });

  it('should handle URLs with different protocols correctly', () => {
    expect(pipe.transform('http://different.com')).toBeTrue();

    (WindowHelper.getLocation as jasmine.Spy).and.returnValue({
      href: 'https://example.com',
      hostname: 'example.com'
    } as Location);

    expect(pipe.transform('http://example.com')).toBeFalse();
  });

  it('should handle invalid URLs correctly', () => {
    expect(pipe.transform('not-a-valid-url')).toBeFalse();
    expect(pipe.transform('://invalid-url')).toBeFalse();
  });

  it('should return false when URL parsing throws an error', () => {
    expect(pipe.transform(':invalid-format')).toBeFalse();
  });

  it('should return false for empty string', () => {
    expect(pipe.transform('')).toBeFalse();
  });

  it('should handle different base URLs correctly', () => {
    (WindowHelper.getLocation as jasmine.Spy).and.returnValue({
      href: 'https://another-site.org/path',
      hostname: 'another-site.org'
    } as Location);

    expect(pipe.transform('https://another-site.org/different-path')).toBeFalse();
    expect(pipe.transform('https://example.com/page')).toBeTrue();
  });

  it('should return false when URL constructor throws an exception', () => {
    spyOn(console, 'error'); // Suppress error logging in test
    const originalURL = globalThis.URL;
    (globalThis as any).URL = jasmine.createSpy('URL').and.throwError('InvalidURL');
    expect(pipe.transform('https://example.com/page')).toBeFalse();
    expect(console.error).toHaveBeenCalledWith('Invalid URL:', 'https://example.com/page', jasmine.any(Error));
    globalThis.URL = originalURL;
  });
});
