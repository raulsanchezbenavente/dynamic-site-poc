import { WindowHelper } from '../window-helper';

describe('WindowHelper', () => {
  describe('getLocation', () => {
    it('should return the location object', () => {
      const location = WindowHelper.getLocation();
      expect(location).toBeDefined();
    });
  });
});