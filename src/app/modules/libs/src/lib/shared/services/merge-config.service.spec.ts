import { MergeConfigsService } from './merge-config.service';

describe('MergeConfigsService', () => {
  let service: MergeConfigsService;

  beforeEach(() => {
    service = new MergeConfigsService();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should merge two objects shallowly', () => {
    const target = { a: 1, b: 2 };
    const source = { b: 3, c: 4 };
    const result = service.mergeConfigs(target, source);
    expect(result).toEqual({ a: 1, b: 3, c: 4 });
  });

  it('should merge nested objects', () => {
    const target = { a: { x: 1 }, b: 2 };
    const source = { a: { y: 2 }, b: 3 };
    const result = service.mergeConfigs(target, source);
    expect(result).toEqual({ a: { x: 1, y: 2 }, b: 3 });
  });

  it('should handle null/undefined target and source', () => {
    expect(service.mergeConfigs(undefined, { a: 1 })).toEqual({ a: 1 });
    expect(service.mergeConfigs({ a: 1 }, undefined)).toEqual({ a: 1 });
    expect(service.mergeConfigs(undefined, undefined)).toEqual({});
  });
});
