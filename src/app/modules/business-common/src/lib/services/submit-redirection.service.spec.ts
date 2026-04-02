import { SubmitRedirectionService } from './submit-redirection.service';
import type { ActionButtonData, PaymentUrlParams } from '@dcx/ui/business-common';

describe('SubmitRedirectionService', () => {
  let service: SubmitRedirectionService;

  beforeEach(() => {
    service = new SubmitRedirectionService();
  });

  it('exposes null submit params by default', () => {
    expect(service.submitParams()).toBeNull();
  });

  it('updates submit params when setSubmitParams is called', () => {
    const params = {} as Partial<ActionButtonData>;

    service.setSubmitParams(params);

    expect(service.submitParams()).toBe(params);
  });

  it('clears submit params via clearSubmitParams', () => {
    service.setSubmitParams({} as Partial<ActionButtonData>);

    service.clearSubmitParams();

    expect(service.submitParams()).toBeNull();
  });

  it('creates a payment url by replacing all placeholders', () => {
    const template =
      'https://pay.example.com/{culture}/{PNR}/{TabId}/{PosCode}/{Prefix}/{currency}/{flow}/{sessionRef}/{source}';
    const params = {
      culture: 'en-US',
      pnr: 'ABC123',
      tabSessionId: 'tab-42',
      posCode: 'POS123',
      prefix: 'PFX',
      currency: 'USD',
      flow: 'checkin',
      sessionRef: 'session-1',
      source: 'mobile',
    } as PaymentUrlParams;

    const url = service.createPaymentUrl(template, params);

    expect(url).toBe(
      'https://pay.example.com/en-US/ABC123/tab-42/POS123/PFX/USD/checkin/session-1/mobile'
    );
  });

  it('falls back to the POS code when no prefix is provided', () => {
    const template = 'https://pay.example.com/{Prefix}/{PosCode}';
    const params = {
      posCode: 'POS999',
    } as PaymentUrlParams;

    const url = service.createPaymentUrl(template, params);

    expect(url).toBe('https://pay.example.com/POS999/POS999');
  });
});
