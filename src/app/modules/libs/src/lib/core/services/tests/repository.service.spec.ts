import { TestBed } from '@angular/core/testing';
import { nsStore, RepositoryService } from '../repository.service';
import { LoggerService } from '../logger.service';
import { RepositoryModel } from '../../models/repository-model';


describe('RepositoryService', () => {
  let service: RepositoryService;
  let loggerServiceSpy: jasmine.SpyObj<LoggerService>;

  beforeEach(() => {
    loggerServiceSpy = jasmine.createSpyObj('LoggerService', ['error']);

    TestBed.configureTestingModule({
      providers: [
        RepositoryService,
        { provide: LoggerService, useValue: loggerServiceSpy },
      ],
    });

    service = TestBed.inject(RepositoryService);

    spyOn(nsStore, 'setItem').and.returnValue(Promise.resolve());
    spyOn(nsStore, 'getItem').and.returnValue(Promise.resolve(null));
    spyOn(nsStore, 'removeItem').and.returnValue(Promise.resolve());
    spyOn(nsStore, 'clear').and.returnValue(Promise.resolve());
    spyOn(nsStore, 'iterate').and.callFake((callback: any) => Promise.resolve(callback(null, null)));
  });

  describe('setItem', () => {
    it('should store an item', (done) => {
      const key = 'testKey';
      const value = { data: 'testData' };

      service.setItem(key, value).subscribe(() => {
        expect(nsStore.setItem).toHaveBeenCalledWith(
          key,
          jasmine.objectContaining({ content: value })
        );
        done();
      });
    });

    it('should log an error when setItem fails', (done) => {
      const errorMock = new Error('setItem failed');
    
      (nsStore.setItem as jasmine.Spy).and.returnValue(Promise.reject(errorMock));
    
      service.setItem('testKey', { data: 'test' }).subscribe(() => {
        expect(loggerServiceSpy.error).toHaveBeenCalledWith('RepositoryService', 'setItem', errorMock);
        done();
      });
    });
  });

  describe('getItem', () => {
    it('should retrieve an item', (done) => {
      const key = 'testKey';
      const storedItem: RepositoryModel<any> = { ttl: Date.now() + 10000, content: { data: 'testData' } };

      (nsStore.getItem as jasmine.Spy).and.returnValue(Promise.resolve(storedItem));

      service.getItem(key).subscribe((result) => {
        expect(result).toEqual(storedItem.content);
        expect(nsStore.getItem).toHaveBeenCalledWith(key);
        done();
      });
    });

    it('should remove expired items on retrieval', (done) => {
      const key = 'expiredKey';
      const expiredItem: RepositoryModel<any> = { ttl: Date.now() - 10000, content: { data: 'expiredData' } };

      (nsStore.getItem as jasmine.Spy).and.returnValue(Promise.resolve(expiredItem));

      service.getItem(key).subscribe(() => {
        expect(nsStore.removeItem).toHaveBeenCalledWith(key);
        done();
      });
    });

    it('should log an error when getItem fails', (done) => {
      const errorMock = new Error('getItem failed');
  
      (nsStore.getItem as jasmine.Spy).and.returnValue(Promise.reject(errorMock));
  
      service.getItem('testKey').subscribe(() => {
        expect(loggerServiceSpy.error).toHaveBeenCalledWith('RepositoryService', 'getItem', errorMock);
        done();
      });
    });
  
    it('should log an error when removeItem fails after retrieving an expired item', (done) => {
      const expiredItem = { ttl: Date.now() - 1000, content: { data: 'test' } };
      const errorMock = new Error('removeItem failed');
  
      (nsStore.getItem as jasmine.Spy).and.returnValue(Promise.resolve(expiredItem));

      (nsStore.removeItem as jasmine.Spy).and.returnValue(Promise.reject(errorMock));
  
      service.getItem('testKey').subscribe(() => {
        expect(loggerServiceSpy.error).toHaveBeenCalledWith('RepositoryService', 'getItemremove expired item', errorMock);
        done();
      });
    });
  });

  describe('removeItem', () => {
    it('should remove a specific item', (done) => {
      const key = 'deleteKey';

      service.removeItem(key).subscribe(() => {
        expect(nsStore.removeItem).toHaveBeenCalledWith(key);
        done();
      });
    });

    it('should log an error when removeItem fails', (done) => {
      const errorMock = new Error('removeItem failed');
  
      (nsStore.removeItem as jasmine.Spy).and.returnValue(Promise.reject(errorMock));
  
      service.removeItem('testKey').subscribe(() => {
        expect(loggerServiceSpy.error).toHaveBeenCalledWith('RepositoryService', 'removeItem', errorMock);
        done();
      });
    });
  });

  describe('clear', () => {
    it('should clear all items', (done) => {
      service.clear().subscribe(() => {
        expect(nsStore.clear).toHaveBeenCalled();
        done();
      });
    });

    it('should log an error when clear fails', (done) => {
      const errorMock = new Error('clear failed');

      (nsStore.clear as jasmine.Spy).and.returnValue(Promise.reject(errorMock));
  
      service.clear().subscribe(() => {
        expect(loggerServiceSpy.error).toHaveBeenCalledWith('RepositoryService', 'clear', errorMock);
        done();
      });
    });
  });

  describe('validateCache', () => {
    it('should validate cache and remove expired items', (done) => {
      const oldKey = `${Date.now() - 86500000}_old`;
      const recentKey = `${Date.now() + 10000}_recent`;

      (nsStore.iterate as jasmine.Spy).and.callFake((callback: any) => {
        callback({ ttl: Date.now() - 86500000 }, oldKey);
        callback({ ttl: Date.now() + 10000 }, recentKey);
        return Promise.resolve();
      });

      service.validateCache().subscribe(() => {
        expect(nsStore.removeItem).toHaveBeenCalledWith(oldKey);
        expect(nsStore.removeItem).not.toHaveBeenCalledWith(recentKey);
        done();
      });
    });

    it('should complete without deleting any items when no expired items exist', (done) => {
      (nsStore.iterate as jasmine.Spy).and.callFake((callback: any) => {
        callback({ ttl: Date.now() + 10000 }, 'validKey1');
        callback({ ttl: Date.now() + 20000 }, 'validKey2');
        return Promise.resolve();
      });
  
      service.validateCache().subscribe(() => {
        expect(nsStore.removeItem).not.toHaveBeenCalled();
        done();
      });
    });

    it('should log an error when iterate fails', (done) => {
      const errorMock = new Error('Iterate failed');
 
      (nsStore.iterate as jasmine.Spy).and.returnValue(Promise.reject(errorMock));
    
      service.validateCache().subscribe(() => {
        expect(loggerServiceSpy.error).toHaveBeenCalledWith('RepositoryService', 'validateOnInit', errorMock);
        done();
      });
    });
  });

  describe('setTTL', () => {
    it('should update the TTL value', () => {
      const newTTL = 5000;
      service.setTTL(newTTL);
      expect((service as any)._ttl).toBe(newTTL);
    });
  });
  
});

