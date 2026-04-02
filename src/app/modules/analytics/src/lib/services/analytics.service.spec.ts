// analytics.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { AnalyticsService } from './analytics.service';
import { AnalyticsEngine } from '../enums/analytics-engines.enum';
import { AnalyticsConfig } from '../interfaces/analytics-config.interface';
import { GoogleAnalyticsService } from '../strategies/google-analytics.strategy';
import { GTMService } from '../strategies/gtm-analytics.strategy';
import { AmplitudeService } from '../strategies/amplitude.strategy';
import { YandexMetricaService } from '../strategies/yandex-analytics.strategy';
import { isDispatchValid } from './check-engines.test-utils';

describe('AnalyticsService (public API, dispatcher with config)', () => {
  let service: AnalyticsService;

  // Strategy spies (no real logic)
  let ga: jasmine.SpyObj<GoogleAnalyticsService>;
  let gtm: jasmine.SpyObj<GTMService>;
  let amp: jasmine.SpyObj<AmplitudeService>;
  let yan: jasmine.SpyObj<YandexMetricaService>;

  const CONFIG: AnalyticsConfig = {
    analyticsEngines: [
      { engine: AnalyticsEngine.GOOGLE_ANALYTICS, accounts: ['G-522JDQ9J50', 'G-R852K86P67'] },
      { engine: AnalyticsEngine.GOOGLE_TAG_MANAGER },
      { engine: AnalyticsEngine.AMPLITUDE },
      { engine: AnalyticsEngine.YANDEX_METRICA, accounts: ['12345678', '87654321'] },
    ],
    analyticsExceptions: [
      {
        eventName: 'purchase',
        analyticsEngines: [
          { engine: AnalyticsEngine.GOOGLE_ANALYTICS },
        ],
      },
      {
        eventName: 'view_item',
        analyticsEngines: [
          { engine: AnalyticsEngine.GOOGLE_ANALYTICS, accounts: ['G-522JDQ9J50'] },
        ],
        includeDefaultEngines: false,
      },
      {
        eventName: 'select_item',
        analyticsEngines: [
          { engine: AnalyticsEngine.GOOGLE_TAG_MANAGER },
        ],
        includeDefaultEngines: true,
      },
      {
        eventName: 'add_to_cart',
        analyticsEngines: [
          { engine: AnalyticsEngine.GOOGLE_TAG_MANAGER },
          { engine: AnalyticsEngine.AMPLITUDE },
        ],
        includeDefaultEngines: false,
      },
      {
        eventName: 'ibe_async',
        analyticsEngines: [
          { engine: AnalyticsEngine.GOOGLE_ANALYTICS, accounts: ['G-R852K86P67'] },
        ],
        includeDefaultEngines: false,
      },
    ],
  };

  beforeEach(() => {
    ga  = jasmine.createSpyObj('GoogleAnalyticsService', ['trackEvent']);
    gtm = jasmine.createSpyObj('GTMService', ['trackEvent']);
    amp = jasmine.createSpyObj('AmplitudeService', ['trackEvent']);
    yan = jasmine.createSpyObj('YandexMetricaService', ['trackEvent']);

    TestBed.configureTestingModule({
      providers: [
        AnalyticsService,
        { provide: GoogleAnalyticsService, useValue: ga },
        { provide: GTMService, useValue: gtm },
        { provide: AmplitudeService, useValue: amp },
        { provide: YandexMetricaService, useValue: yan },
      ],
    });

    service = TestBed.inject(AnalyticsService);
    spyOn(console, 'warn'); // silence warnings in tests
  });

  afterEach(() => {
    [ga, gtm, amp, yan].forEach(s => s.trackEvent.calls.reset());
    (console.warn as any).calls?.reset?.();
  });

  // Utilities
  function expectOnlyCalledWithEvent(event: any, called: Array<jasmine.SpyObj<any>>) {
    const all = [ga, gtm, amp, yan];
    all.forEach(spy => {
      if (called.includes(spy)) {
        expect(spy.trackEvent).toHaveBeenCalledTimes(1);
        const args = spy.trackEvent.calls.mostRecent().args;
        expect(isDispatchValid(CONFIG, args[0].eventName, args[1] || [])).toBeTrue();
        expect(args[0]).toBe(event);          // same reference (use toEqual if you prefer)
      } else {
        expect(spy.trackEvent).not.toHaveBeenCalled();
      }
    });
  }

  it('without config → warns and does not dispatch', () => {
    const e = { eventName: 'ANY' } as any;
    service.trackEvent(e);
    expect(console.warn).toHaveBeenCalledWith('Analytics configuration is not set.');
    expectOnlyCalledWithEvent(e, []); // none called
  });

  it('event NOT listed in exceptions → uses ALL default engines', () => {
    service.setConfig(CONFIG);
    const e = { eventName: 'SOME_OTHER_EVENT' } as any;
    service.trackEvent(e);

    expectOnlyCalledWithEvent(e, [ga, gtm, amp, yan]);
  });

  it('PURCHASE (without includeDefaultEngines) → replaced by GA only', () => {
    service.setConfig(CONFIG);
    const e = { eventName: 'purchase' } as any;
    service.trackEvent(e);

    expectOnlyCalledWithEvent(e, [ga]);
  });

  it('VIEW_ITEM (includeDefaultEngines=false) → GA only', () => {
    service.setConfig(CONFIG);
    const e = { eventName: 'view_item' } as any;
    service.trackEvent(e);

    expectOnlyCalledWithEvent(e, [ga]);
  });

  it('SELECT_ITEM (includeDefaultEngines=true) → defaults ∪ exception (no duplicates) = all defaults', () => {
    service.setConfig(CONFIG);
    const e = { eventName: 'select_item' } as any;
    service.trackEvent(e);

    // The exception adds GTM, which is already in defaults → result is all defaults
    expectOnlyCalledWithEvent(e, [ga, gtm, amp, yan]);
  });

  it('ADD_TO_CART (includeDefaultEngines=false) → GTM and AMPLITUDE', () => {
    service.setConfig(CONFIG);
    const e = { eventName: 'add_to_cart' } as any;
    service.trackEvent(e);

    expectOnlyCalledWithEvent(e, [gtm, amp]);
  });

  it('IBE_ASYNC (includeDefaultEngines=false) → GA only', () => {
    service.setConfig(CONFIG);
    const e = { eventName: 'ibe_async' } as any;
    service.trackEvent(e);

    expectOnlyCalledWithEvent(e, [ga]);
  });

  it('unknown engine in config → warns and nothing is called (sanity)', () => {
    service.setConfig({ analyticsEngines: [{ engine: 9999 as any }] });
    const e = { eventName: 'UnknownEngine' } as any;
    service.trackEvent(e);

    expect(console.warn).toHaveBeenCalledWith('No service found for engine: 9999');
    expectOnlyCalledWithEvent(e, []);
  });
});
