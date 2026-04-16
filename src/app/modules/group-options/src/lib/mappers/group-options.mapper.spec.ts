import { TestBed } from '@angular/core/testing';
import { AvailableOption, GroupOptionElementData } from '@dcx/ui/design-system';
import { GroupOptionsMapper } from './group-options.mapper';


describe('GroupOptionsMapper', () => {
  let mapper: GroupOptionsMapper;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    mapper = TestBed.inject(GroupOptionsMapper);
  });

  const createConfiguredOption = (code: string, title: string): GroupOptionElementData => ({
    code,
    title,
    description: `Description for ${title}`,
    isDisabled: false,
  });

  const createAvailableOption = (code: string, isDisabled: boolean): AvailableOption => ({
    code,
    isDisabled,
  });

  describe('Empty or invalid inputs', () => {
    it('should return empty array when both arrays are empty', () => {
      const result = mapper.enrichOptionsWithAvailability([], []);

      expect(result).toEqual([]);
    });

    it('should return empty array when configured options is empty', () => {
      const available = [createAvailableOption('opt1', false)];

      const result = mapper.enrichOptionsWithAvailability([], available);

      expect(result).toEqual([]);
    });

    it('should return empty array when available options is empty', () => {
      const configured = [createConfiguredOption('opt1', 'Option 1')];

      const result = mapper.enrichOptionsWithAvailability(configured, []);

      expect(result).toEqual([]);
    });

    it('should return empty array when configured options is null/undefined', () => {
      const available = [createAvailableOption('opt1', false)];

      expect(mapper.enrichOptionsWithAvailability(null as any, available)).toEqual([]);
      expect(mapper.enrichOptionsWithAvailability(undefined as any, available)).toEqual([]);
    });
  });

  describe('Filtering logic', () => {
    it('should filter out unavailable options', () => {
      const configured = [
        createConfiguredOption('opt1', 'Option 1'),
        createConfiguredOption('opt2', 'Option 2'),
        createConfiguredOption('opt3', 'Option 3'),
      ];
      const available = [createAvailableOption('opt1', false), createAvailableOption('opt3', false)];

      const result = mapper.enrichOptionsWithAvailability(configured, available);

      expect(result.length).toBe(2);
      expect(result[0].code).toBe('opt1');
      expect(result[1].code).toBe('opt3');
    });

    it('should skip options without code', () => {
      const configured = [
        createConfiguredOption('opt1', 'Option 1'),
        { title: 'No Code Option' } as GroupOptionElementData,
        createConfiguredOption('opt2', 'Option 2'),
      ];
      const available = [
        createAvailableOption('opt1', false),
        createAvailableOption('opt2', false),
        createAvailableOption('', false),
      ];

      const result = mapper.enrichOptionsWithAvailability(configured, available);

      expect(result.length).toBe(2);
      expect(result[0].code).toBe('opt1');
      expect(result[1].code).toBe('opt2');
    });

    it('should include only options that exist in available list', () => {
      const configured = [
        createConfiguredOption('opt1', 'Option 1'),
        createConfiguredOption('opt2', 'Option 2'),
        createConfiguredOption('opt3', 'Option 3'),
      ];
      const available = [createAvailableOption('opt2', false)];

      const result = mapper.enrichOptionsWithAvailability(configured, available);

      expect(result.length).toBe(1);
      expect(result[0].code).toBe('opt2');
    });
  });

  describe('Disabled state enrichment', () => {
    it('should mark options as disabled based on availability state', () => {
      const configured = [
        createConfiguredOption('opt1', 'Option 1'),
        createConfiguredOption('opt2', 'Option 2'),
      ];
      const available = [createAvailableOption('opt1', true), createAvailableOption('opt2', false)];

      const result = mapper.enrichOptionsWithAvailability(configured, available);

      expect(result[0].isDisabled).toBe(true);
      expect(result[1].isDisabled).toBe(false);
    });

    it('should override configured disabled state with availability state', () => {
      const configured = [{ code: 'opt1', title: 'Option 1', isDisabled: false } as GroupOptionElementData];
      const available = [createAvailableOption('opt1', true)];

      const result = mapper.enrichOptionsWithAvailability(configured, available);

      expect(result[0].isDisabled).toBe(true);
    });

    it('should keep all other properties from configured options', () => {
      const configured = [
        {
          code: 'opt1',
          title: 'Option 1',
          description: 'Description',
          buttonText: 'Click me',
          image: { src: 'test.jpg', altText: 'Test' },
          link: { url: '/test' },
        } as GroupOptionElementData,
      ];
      const available = [createAvailableOption('opt1', false)];

      const result = mapper.enrichOptionsWithAvailability(configured, available);

      expect(result[0].code).toBe('opt1');
      expect(result[0].title).toBe('Option 1');
      expect(result[0].description).toBe('Description');
      expect(result[0].buttonText).toBe('Click me');
      expect(result[0].image).toEqual({ src: 'test.jpg', altText: 'Test' });
      expect(result[0].link).toEqual({ url: '/test' });
      expect(result[0].isDisabled).toBe(false);
    });
  });

  describe('Performance and edge cases', () => {
    it('should handle large number of options efficiently', () => {
      const configured = Array.from({ length: 100 }, (_, i) => createConfiguredOption(`opt${i}`, `Option ${i}`));
      const available = Array.from({ length: 100 }, (_, i) => createAvailableOption(`opt${i}`, i % 2 === 0));

      const result = mapper.enrichOptionsWithAvailability(configured, available);

      expect(result.length).toBe(100);
    });

    it('should maintain original order of configured options', () => {
      const configured = [
        createConfiguredOption('opt3', 'Option 3'),
        createConfiguredOption('opt1', 'Option 1'),
        createConfiguredOption('opt2', 'Option 2'),
      ];
      const available = [
        createAvailableOption('opt1', false),
        createAvailableOption('opt2', false),
        createAvailableOption('opt3', false),
      ];

      const result = mapper.enrichOptionsWithAvailability(configured, available);

      expect(result[0].code).toBe('opt3');
      expect(result[1].code).toBe('opt1');
      expect(result[2].code).toBe('opt2');
    });

    it('should handle duplicate codes in available options (uses last match)', () => {
      const configured = [createConfiguredOption('opt1', 'Option 1')];
      const available = [createAvailableOption('opt1', false), createAvailableOption('opt1', true)];

      const result = mapper.enrichOptionsWithAvailability(configured, available);

      expect(result.length).toBe(1);
      // Map constructor with array of [key, value] uses the LAST occurrence when there are duplicates
      expect(result[0].isDisabled).toBe(true);
    });
  });
});
