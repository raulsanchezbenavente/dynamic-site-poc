import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ModuleTranslationMapService } from './module-translation-map.service';
import { ModuleTranslationService } from '@dcx/module/translation';
import { MODULE_TRANSLATION_MAP } from '../config/module-translation-map';

describe('ModuleTranslationMapService', () => {
  let service: ModuleTranslationMapService;
  let moduleTranslationService: jasmine.SpyObj<ModuleTranslationService>;

  beforeEach(() => {
    const moduleTranslationServiceSpy = jasmine.createSpyObj('ModuleTranslationService', [
      'loadModuleTranslations',
    ]);

    TestBed.configureTestingModule({
      providers: [
        ModuleTranslationMapService,
        { provide: ModuleTranslationService, useValue: moduleTranslationServiceSpy },
      ],
    });

    service = TestBed.inject(ModuleTranslationMapService);
    moduleTranslationService = TestBed.inject(
      ModuleTranslationService
    ) as jasmine.SpyObj<ModuleTranslationService>;

    moduleTranslationService.loadModuleTranslations.and.returnValue(
      of({ success: true, data: {} })
    );
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('preLoadTranslations', () => {
    it('should return observable that loads translations for a single module with configured translations', () => {
      const moduleNames = ['MultiTab'];
      const expectedTranslations = MODULE_TRANSLATION_MAP['MultiTab'];

      const result = service.preLoadTranslations(moduleNames);

      expect(result).toBeTruthy();
      expect(moduleTranslationService.loadModuleTranslations).toHaveBeenCalledWith({
        moduleName: jasmine.arrayContaining(expectedTranslations),
      });
      expect(moduleTranslationService.loadModuleTranslations).toHaveBeenCalledTimes(1);
    });

    it('should return observable that loads translations for multiple modules', () => {
      const moduleNames = ['MultiTab', 'LoyaltyOverviewCard'];
      const expectedTranslations = [
        ...MODULE_TRANSLATION_MAP['MultiTab'],
        ...MODULE_TRANSLATION_MAP['LoyaltyOverviewCard'],
      ];

      const result = service.preLoadTranslations(moduleNames);

      expect(result).toBeTruthy();
      expect(moduleTranslationService.loadModuleTranslations).toHaveBeenCalledWith({
        moduleName: jasmine.arrayContaining(expectedTranslations),
      });
      expect(moduleTranslationService.loadModuleTranslations).toHaveBeenCalledTimes(1);
    });

    it('should deduplicate translation keys when multiple modules share translations', () => {
      const moduleNames = ['CheckInSummary', 'CheckInConfirmation'];
      // Both modules share 'CheckIn', 'City', 'Common', 'Schedule', 'Journey', 'BoardingPass'

      const result = service.preLoadTranslations(moduleNames);

      expect(result).toBeTruthy();
      const callArgs = moduleTranslationService.loadModuleTranslations.calls.argsFor(0)[0];
      const translations = callArgs.moduleName as string[];

      // Count occurrences of a common key like 'Common'
      const commonCount = translations.filter((t) => t === 'Common').length;
      expect(commonCount).toBe(1); // Should only appear once

      expect(moduleTranslationService.loadModuleTranslations).toHaveBeenCalledTimes(1);
    });

    it('should log a warning when module has no configured translations and return null', () => {
      spyOn(console, 'warn');
      const moduleNames = ['NonExistentModule'];

      const result = service.preLoadTranslations(moduleNames);

      expect(result).toBeNull();
      expect(console.warn).toHaveBeenCalledWith(
        '[ModuleTranslationMapService] No translations configured for module: NonExistentModule'
      );
      expect(moduleTranslationService.loadModuleTranslations).not.toHaveBeenCalled();
    });

    it('should log a warning when module has undefined translations in config and return null', () => {
      spyOn(console, 'warn');
      const moduleNames = ['UndefinedModule'];

      const result = service.preLoadTranslations(moduleNames);

      expect(result).toBeNull();
      expect(console.warn).toHaveBeenCalledWith(
        '[ModuleTranslationMapService] No translations configured for module: UndefinedModule'
      );
      expect(moduleTranslationService.loadModuleTranslations).not.toHaveBeenCalled();
    });

    it('should return null for modules with empty translation arrays', () => {
      const moduleNames = ['CorporateMainBanner']; // Has empty array in config

      const result = service.preLoadTranslations(moduleNames);

      expect(result).toBeNull();
      expect(moduleTranslationService.loadModuleTranslations).not.toHaveBeenCalled();
    });

    it('should handle mixed scenario: valid modules, empty modules, and invalid modules', () => {
      spyOn(console, 'warn');
      const moduleNames = ['MultiTab', 'CorporateMainBanner', 'InvalidModule'];

      const result = service.preLoadTranslations(moduleNames);

      expect(result).toBeTruthy();
      expect(console.warn).toHaveBeenCalledWith(
        '[ModuleTranslationMapService] No translations configured for module: InvalidModule'
      );
      expect(moduleTranslationService.loadModuleTranslations).toHaveBeenCalledWith({
        moduleName: jasmine.arrayContaining(MODULE_TRANSLATION_MAP['MultiTab']),
      });
      expect(moduleTranslationService.loadModuleTranslations).toHaveBeenCalledTimes(1);
    });

    it('should return null when all modules have empty or no translations', () => {
      spyOn(console, 'warn');
      const moduleNames = ['CorporateMainBanner', 'InvalidModule'];

      const result = service.preLoadTranslations(moduleNames);

      expect(result).toBeNull();
      expect(console.warn).toHaveBeenCalledWith(
        '[ModuleTranslationMapService] No translations configured for module: InvalidModule'
      );
      expect(moduleTranslationService.loadModuleTranslations).not.toHaveBeenCalled();
    });

    it('should return null for empty moduleNames array', () => {
      const moduleNames: string[] = [];

      const result = service.preLoadTranslations(moduleNames);

      expect(result).toBeNull();
      expect(moduleTranslationService.loadModuleTranslations).not.toHaveBeenCalled();
    });

    it('should return observable for all unique translations from PageActionButtons module', () => {
      const moduleNames = ['PageActionButtons'];
      const expectedTranslations = MODULE_TRANSLATION_MAP['PageActionButtons'];

      const result = service.preLoadTranslations(moduleNames);

      expect(result).toBeTruthy();
      expect(moduleTranslationService.loadModuleTranslations).toHaveBeenCalledWith({
        moduleName: expectedTranslations,
      });
      expect(moduleTranslationService.loadModuleTranslations).toHaveBeenCalledTimes(1);
    });

    it('should return observable for modules with nested translation keys', () => {
      const moduleNames = ['HeaderFlow'];
      const expectedTranslations = MODULE_TRANSLATION_MAP['HeaderFlow'];

      const result = service.preLoadTranslations(moduleNames);

      expect(result).toBeTruthy();
      expect(moduleTranslationService.loadModuleTranslations).toHaveBeenCalledWith({
        moduleName: jasmine.arrayContaining(expectedTranslations),
      });
      expect(moduleTranslationService.loadModuleTranslations).toHaveBeenCalledTimes(1);
    });

    it('should return the observable from loadModuleTranslations without subscribing', () => {
      const moduleNames = ['MultiTab'];
      const mockObservable = of({ success: true, data: {} });

      moduleTranslationService.loadModuleTranslations.and.returnValue(mockObservable);

      const result = service.preLoadTranslations(moduleNames);

      expect(result).toBe(mockObservable);
      expect(moduleTranslationService.loadModuleTranslations).toHaveBeenCalledTimes(1);
    });
  });
});
