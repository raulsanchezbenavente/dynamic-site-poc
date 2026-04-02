import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';

import { AnalyticsGaGtmColivingRewriteService } from './analytics-ga-gtm-coliving-rewrite.service';

// mock global gtag
declare const gtag: jasmine.Spy;
(globalThis as any).gtag = jasmine.createSpy('gtag');

describe('AnalyticsGaGtmColivingRewriteService', () => {
  let service: AnalyticsGaGtmColivingRewriteService;

  let originalSendBeacon: any;
  let sendBeaconSpy: jasmine.Spy;

  let originalFetch: any;
  let fetchSpy: jasmine.Spy;

  beforeEach(() => {
    // save originals
    originalSendBeacon = (navigator as any).sendBeacon;
    originalFetch = (globalThis as any).fetch;

    // mock sendBeacon before creating the service
    sendBeaconSpy = jasmine.createSpy('sendBeacon').and.returnValue(true);
    (navigator as any).sendBeacon = sendBeaconSpy;

    // mock fetch before creating the service
    fetchSpy = jasmine
      .createSpy('fetch')
      .and.returnValue(Promise.resolve({} as any));
    (globalThis as any).fetch = fetchSpy;

    TestBed.configureTestingModule({
      providers: [
        AnalyticsGaGtmColivingRewriteService,
      ],
    });

    service = TestBed.inject(AnalyticsGaGtmColivingRewriteService);
  });

  afterEach(() => {
    // restore globals
    (navigator as any).sendBeacon = originalSendBeacon;
    (globalThis as any).fetch = originalFetch;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should update enableAnalyticsRequestRewrite based on feature flag', () => {
    const anyService = service as any;

    expect(anyService.enableAnalyticsRequestRewrite).toBeFalse();

    service.initGaGtmColiving(true);
    expect(anyService.enableAnalyticsRequestRewrite).toBeTrue();

    service.initGaGtmColiving(false);
    expect(anyService.enableAnalyticsRequestRewrite).toBeFalse();
  });

  it('shouldApplyRewrite should return true only when flag is active and URL is from google-analytics', () => {
    const anyService = service as any;

    anyService.enableAnalyticsRequestRewrite = false;
    expect(service.shouldApplyRewrite('https://www.google-analytics.com/g/collect')).toBeFalse();

    anyService.enableAnalyticsRequestRewrite = true;
    expect(service.shouldApplyRewrite('https://www.google-analytics.com/g/collect')).toBeTrue();

    expect(service.shouldApplyRewrite('https://www.example.com')).toBeFalse();
  });

  it('gtagWithSuffix should not add suffix when flag is disabled', () => {
    const anyService = service as any;
    anyService.enableAnalyticsRequestRewrite = false;

    const suffix = anyService.SUFFIX_SIGNAL as string;

    (globalThis as any).gtag.calls.reset();

    service.gtagWithSuffix('event', 'view_item', { foo: 'bar' });

    expect((globalThis as any).gtag).toHaveBeenCalledTimes(1);
    const args = (globalThis as any).gtag.calls.mostRecent().args;

    expect(args[0]).toBe('event');
    expect(args[1]).toBe('view_item'); // without suffix
    expect(args[1]).not.toContain(suffix);
    expect(args[2]).toEqual({ foo: 'bar' });
  });

  it('gtagWithSuffix should add suffix when flag is enabled', () => {
    const anyService = service as any;
    anyService.enableAnalyticsRequestRewrite = true;
    const suffix = anyService.SUFFIX_SIGNAL as string;

    (globalThis as any).gtag.calls.reset();

    service.gtagWithSuffix('event', 'view_item', { foo: 'bar' });

    expect((globalThis as any).gtag).toHaveBeenCalledTimes(1);
    const args = (globalThis as any).gtag.calls.mostRecent().args;

    expect(args[0]).toBe('event');
    expect(args[1]).toBe('view_item' + suffix); // with suffix
    expect(args[2]).toEqual({ foo: 'bar' });
  });

  it('overrideSendBeacon should clean suffixes in URL and payload when shouldApplyRewrite is true', () => {
    const anyService = service as any;
    anyService.enableAnalyticsRequestRewrite = true;
    const suffix = anyService.SUFFIX_SIGNAL as string;

    sendBeaconSpy.calls.reset();

    const originalUrl =
      'https://www.google-analytics.com/g/collect' + suffix;
    const originalPayload =
      'payload1' + suffix + '\r\n' + 'payload2' + suffix;

    // Call the overridden version of navigator.sendBeacon
    (navigator as any).sendBeacon(originalUrl, originalPayload);

    expect(sendBeaconSpy).toHaveBeenCalledTimes(1);
    const [finalUrl, finalData] = sendBeaconSpy.calls.mostRecent().args;

    expect(finalUrl).toBe(
      'https://www.google-analytics.com/g/collect'
    );
    expect(finalUrl).not.toContain(suffix);

    expect(typeof finalData).toBe('string');
    expect(finalData).not.toContain(suffix);

    const lines = (finalData as string).split('\r\n');
    expect(lines[0]).toBe('payload1');
    expect(lines[1]).toBe('payload2');
  });

  it('overrideSendBeacon should not change anything when shouldApplyRewrite is false', () => {
    const anyService = service as any;
    anyService.enableAnalyticsRequestRewrite = false;
    const suffix = anyService.SUFFIX_SIGNAL as string;

    sendBeaconSpy.calls.reset();

    const originalUrl =
      'https://www.google-analytics.com/g/collect' + suffix;
    const originalPayload =
      'payload1' + suffix + '\r\n' + 'payload2' + suffix;

    (navigator as any).sendBeacon(originalUrl, originalPayload);

    expect(sendBeaconSpy).toHaveBeenCalledTimes(1);
    const [finalUrl, finalData] = sendBeaconSpy.calls.mostRecent().args;

    // Without rewrite: url and payload should arrive as is
    expect(finalUrl).toBe(originalUrl);
    expect(finalData).toBe(originalPayload);
  });

  it('overrideFetch should clean suffixes in URL (string) and body when shouldApplyRewrite is true', async () => {
    const anyService = service as any;
    anyService.enableAnalyticsRequestRewrite = true;
    const suffix = anyService.SUFFIX_SIGNAL as string;

    fetchSpy.calls.reset();

    const originalUrl =
      'https://www.google-analytics.com/g/collect' + suffix;
    const originalBody =
      'line1' + suffix + '\r\n' + 'line2' + suffix;

    await (globalThis as any).fetch(originalUrl, {
      method: 'POST',
      body: originalBody,
    });

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [finalInput, finalInit] = fetchSpy.calls.mostRecent().args;

    expect(typeof finalInput).toBe('string');
    expect(finalInput).toBe(
      'https://www.google-analytics.com/g/collect'
    );
    expect((finalInput as string)).not.toContain(suffix);

    expect(finalInit!.body).toBe('line1\r\nline2');
    expect((finalInit!.body as string)).not.toContain(suffix);
  });

  it('overrideFetch should not change URL/body when shouldApplyRewrite is false', async () => {
    const anyService = service as any;
    anyService.enableAnalyticsRequestRewrite = false;
    const suffix = anyService.SUFFIX_SIGNAL as string;

    fetchSpy.calls.reset();

    const originalUrl =
      'https://www.google-analytics.com/g/collect' + suffix;
    const originalBody =
      'line1' + suffix + '\r\n' + 'line2' + suffix;

    await (globalThis as any).fetch(originalUrl, {
      method: 'POST',
      body: originalBody,
    });

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [finalInput, finalInit] = fetchSpy.calls.mostRecent().args;

    expect(finalInput).toBe(originalUrl);
    expect(finalInit!.body).toBe(originalBody);
  });

  it('ngOnDestroy should call unsubscribe$ subject', () => {
    const anyService = service as any;
    const unsubscribeSpy = spyOn(anyService.unsubscribe$, 'next');
    const completeSpy = spyOn(anyService.unsubscribe$, 'complete');

    service.ngOnDestroy();

    expect(unsubscribeSpy).toHaveBeenCalled();
    expect(completeSpy).toHaveBeenCalled();
  });
});
