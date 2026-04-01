import { I18n } from './I18n';

describe('I18n Service', () => {
  let service: I18n;

  beforeEach(() => {
    service = new I18n();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have default language as en-US', () => {
    expect(service.language).toBe('en-US');
  });

  it('should set language correctly', () => {
    service.language = 'fr-FR';
    expect(service.language).toBe('fr-FR');
  });
});
