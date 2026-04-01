import { TestBed } from '@angular/core/testing';

import { UserCulture } from '../../models';

import { DEFAULT_CULTURE } from './default-culture';
import { CultureService } from './culture.service';

describe('CultureService', () => {
  let service: CultureService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CultureService],
    });

    service = TestBed.inject(CultureService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('culture', () => {
    it('should return default culture when no id is provided', () => {
      expect(service.culture()).toEqual(DEFAULT_CULTURE);
    });

    it('should fall back to default culture when id is unknown', () => {
      expect(service.culture('UNKNOWN')).toEqual(DEFAULT_CULTURE);
    });
  });

  describe('setCulture', () => {
    it('should update the default culture when no id is provided', () => {
      const updated: UserCulture = { locale: 'es-ES', language: 'es' };

      service.setCulture(updated);

      expect(service.culture()).toEqual(updated);
    });

    it('should create or update a named culture without changing default', () => {
      const secondary: UserCulture = { locale: 'fr-FR', language: 'fr' };

      service.setCulture(secondary, 'SECONDARY');

      expect(service.culture('SECONDARY')).toEqual(secondary);
      expect(service.culture()).toEqual(DEFAULT_CULTURE);
    });
  });

  describe('setDefaultCulture', () => {
    it('should switch default to an existing culture id', () => {
      const secondary: UserCulture = { locale: 'pt-BR', language: 'pt' };

      service.setCulture(secondary, 'SECONDARY');
      service.setDefaultCulture('SECONDARY');

      expect(service.culture()).toEqual(secondary);
    });

    it('should add default culture data when id is missing', () => {
      service.setDefaultCulture('NEW_DEFAULT');

      expect(service.culture()).toEqual(DEFAULT_CULTURE);
      expect(service.culture('NEW_DEFAULT')).toEqual(DEFAULT_CULTURE);
    });
  });

  describe('removeCulture', () => {
    it('should remove non-default culture', () => {
      const secondary: UserCulture = { locale: 'it-IT', language: 'it' };

      service.setCulture(secondary, 'SECONDARY');
      service.removeCulture('SECONDARY');

      expect(service.culture('SECONDARY')).toEqual(DEFAULT_CULTURE);
    });

    it('should not remove the current default culture', () => {
      service.removeCulture('DEFAULT');

      expect(service.culture()).toEqual(DEFAULT_CULTURE);
    });
  });
});
