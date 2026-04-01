import { urlHelpers } from './url-helper';

describe('urlHelpers', () => {
  describe('updateUrlParameter', () => {
    let originalPushState: any;
    let mockPushState: jasmine.Spy;

    beforeEach(() => {
      originalPushState = globalThis.history.pushState;
      mockPushState = jasmine.createSpy('pushState');
      globalThis.history.pushState = mockPushState;
    });

    afterEach(() => {
      globalThis.history.pushState = originalPushState;
    });

    it('should update existing URL parameter', () => {
      // Mock URL constructor to simulate URL API
      const mockUrl = {
        pathname: '/test',
        search: '?posCode=CO&other=value',
        searchParams: {
          has: jasmine.createSpy('has').and.returnValue(true),
          set: jasmine.createSpy('set').and.callFake(() => {
            mockUrl.search = '?posCode=US&other=value';
          })
        }
      };

      spyOn(globalThis, 'URL').and.returnValue(mockUrl as any);

      urlHelpers.updateUrlParameter('posCode', 'US');

      expect(mockUrl.searchParams.has).toHaveBeenCalledWith('posCode');
      expect(mockUrl.searchParams.set).toHaveBeenCalledWith('posCode', 'US');
      expect(mockPushState).toHaveBeenCalledWith({}, '', '/test?posCode=US&other=value');
    });

    it('should not update parameter when it does not exist in URL', () => {
      const mockUrl = {
        pathname: '/test',
        search: '?other=value',
        searchParams: {
          has: jasmine.createSpy('has').and.returnValue(false),
          set: jasmine.createSpy('set')
        }
      };

      spyOn(globalThis, 'URL').and.returnValue(mockUrl as any);

      urlHelpers.updateUrlParameter('posCode', 'US');

      expect(mockUrl.searchParams.has).toHaveBeenCalledWith('posCode');
      expect(mockUrl.searchParams.set).not.toHaveBeenCalled();
      expect(mockPushState).not.toHaveBeenCalled();
    });

    it('should not update parameter when value is empty', () => {
      const mockUrl = {
        pathname: '/test',
        search: '?posCode=CO&other=value',
        searchParams: {
          has: jasmine.createSpy('has'),
          set: jasmine.createSpy('set')
        }
      };

      spyOn(globalThis, 'URL').and.returnValue(mockUrl as any);

      urlHelpers.updateUrlParameter('posCode', '');

      expect(mockUrl.searchParams.has).not.toHaveBeenCalled();
      expect(mockUrl.searchParams.set).not.toHaveBeenCalled();
      expect(mockPushState).not.toHaveBeenCalled();
    });

    it('should not update parameter when value is null or undefined', () => {
      const mockUrl = {
        pathname: '/test',
        search: '?posCode=CO&other=value',
        searchParams: {
          has: jasmine.createSpy('has'),
          set: jasmine.createSpy('set')
        }
      };

      spyOn(globalThis, 'URL').and.returnValue(mockUrl as any);

      urlHelpers.updateUrlParameter('posCode', null as any);
      urlHelpers.updateUrlParameter('posCode', undefined as any);

      expect(mockUrl.searchParams.has).not.toHaveBeenCalled();
      expect(mockUrl.searchParams.set).not.toHaveBeenCalled();
      expect(mockPushState).not.toHaveBeenCalled();
    });
  });
});