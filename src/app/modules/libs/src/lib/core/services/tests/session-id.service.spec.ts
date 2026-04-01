import { TestBed } from '@angular/core/testing';

import { StorageService } from '@dcx/ui/libs';
import { EnumStorageKey } from '../../../shared/enums/enum-storage-keys';
import { SessionIdService } from '../session-id.service';

describe('SessionIdService', () => {
  let storageServiceMock: jasmine.SpyObj<StorageService>;

  function createService(sessionStorageMap: Partial<Record<EnumStorageKey, unknown>> = {}): SessionIdService {
    storageServiceMock = jasmine.createSpyObj<StorageService>('StorageService', [
      'getSessionStorage',
      'setSessionStorage',
    ]);
    storageServiceMock.getSessionStorage.and.callFake(
      (key: string) => sessionStorageMap[key as EnumStorageKey] ?? undefined,
    );

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        { provide: StorageService, useValue: storageServiceMock },
        SessionIdService,
      ],
    });

    return TestBed.inject(SessionIdService);
  }

  it('should be created', () => {
    const service = createService();

    expect(service).toBeTruthy();
  });

  it('should create new session id if not present', () => {
    const service = createService();

    expect(storageServiceMock.setSessionStorage).toHaveBeenCalledWith(
      EnumStorageKey.TabSessionId,
      jasmine.objectContaining({ tabSessionId: jasmine.any(String) }),
    );
    expect(service.sessionId).toBeDefined();
    expect(service.sessionId).not.toBe('');
  });

  it('should reuse existing session id from storage', () => {
    const service = createService({
      [EnumStorageKey.TabSessionId]: { tabSessionId: 'existing-123' },
    });

    expect(service.sessionId).toBe('existing-123');
    expect(storageServiceMock.setSessionStorage).not.toHaveBeenCalled();
  });

  describe('regenerateSessionId', () => {
    it('should generate a new session id and store it', () => {
      const service = createService();
      storageServiceMock.setSessionStorage.calls.reset();

      service.regenerateSessionId();

      expect(storageServiceMock.setSessionStorage).toHaveBeenCalledWith(
        EnumStorageKey.TabSessionId,
        jasmine.objectContaining({ tabSessionId: jasmine.any(String) }),
      );
      expect(service.sessionId).toBeDefined();
      expect(service.sessionId).not.toBe('');
    });

    it('should produce a different id on each call', async () => {
      const service = createService();

      service.regenerateSessionId();
      const firstId = service.sessionId;

      await new Promise((resolve) => setTimeout(resolve, 5));

      service.regenerateSessionId();
      const secondId = service.sessionId;

      expect(firstId).not.toBe(secondId);
    });
  });
});
