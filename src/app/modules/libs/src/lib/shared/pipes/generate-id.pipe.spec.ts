import { GenerateIdPipe } from './generate-id.pipe';

describe('GenerateIdPipe', () => {
  let pipe: GenerateIdPipe;

  beforeEach(() => {
    pipe = new GenerateIdPipe();
  });

  describe('transform', () => {
    it('should append a numeric suffix to the input string', () => {
      const input = 'testId';
      const result = pipe.transform(input);

      expect(result).toMatch(/^testId\d{1,3}$/); // e.g., testId42 or testId100
      expect(result).toContain('testId');
    });

    it('should return a different result on each call due to randomness', () => {
      const input = 'randomId';
      const results = new Set();
      
      // Generate multiple results to ensure randomness
      for (let i = 0; i < 10; i++) {
        results.add(pipe.transform(input));
      }
      
      // With 10 calls, we should have at least 2 different results
      expect(results.size).toBeGreaterThan(1);
    });
  });

  describe('transformWithUUID', () => {
    it('should append a UUID to the input string', () => {
      const input = 'uuidPrefix';
      const result = pipe.transformWithUUID(input);

      expect(result).toMatch(/^uuidPrefix_[\w\d-]{36}$/); // UUID v4 pattern
    });

    it('should return a unique ID for each call', () => {
      const input = 'uuidPrefix';
      const result1 = pipe.transformWithUUID(input);
      const result2 = pipe.transformWithUUID(input);

      expect(result1).not.toEqual(result2);
    });
  });
});
