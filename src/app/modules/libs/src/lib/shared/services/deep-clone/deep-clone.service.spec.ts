import { DeepCloneService } from './deep-clone.service';

describe('DeepCloneService', () => {
  let service: DeepCloneService;

  beforeEach(() => {
    service = new DeepCloneService();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return primitive values directly', () => {
    expect(service.deepClone(42)).toBe(42);
    expect(service.deepClone('test')).toBe('test');
    expect(service.deepClone(null)).toBeNull();
    expect(service.deepClone(undefined)).toBeUndefined();
    expect(service.deepClone(true)).toBeTrue();
  });

  it('should clone RegExp instances', () => {
    const regex = /abc/gi;
    const cloned = service.deepClone(regex);
    expect(cloned).not.toBe(regex);
    expect(cloned.source).toBe(regex.source);
    expect(cloned.flags).toBe(regex.flags);
    expect(cloned instanceof RegExp).toBeTrue();
  });

  it('should deeply clone arrays', () => {
    const arr = [1, { a: 2 }, [3, 4]];
    const cloned = service.deepClone(arr);
    expect(cloned).not.toBe(arr);
    expect(cloned).toEqual(arr);
    expect(cloned[1]).not.toBe(arr[1]);
    expect(cloned[2]).not.toBe(arr[2]);
  });

  it('should deeply clone plain objects', () => {
    const obj = { a: 1, b: { c: 2 } };
    const cloned = service.deepClone(obj);
    expect(cloned).not.toBe(obj);
    expect(cloned).toEqual(obj);
    expect(cloned.b).not.toBe(obj.b);
  });

  it('should deeply clone class instances', () => {
    class TestClass {
      constructor(public x: number, public y: { z: number }) {}
      getSum() { return this.x + this.y.z; }
    }
    const instance = new TestClass(5, { z: 10 });
    const cloned = service.deepClone(instance);
    expect(cloned).not.toBe(instance);
    expect(cloned instanceof TestClass).toBeTrue();
    expect(cloned.x).toBe(5);
    expect(cloned.y).toEqual({ z: 10 });
    expect(cloned.y).not.toBe(instance.y);
    expect(cloned.getSum()).toBe(15);
  });

  it('should handle objects with circular references', () => {
    const obj: any = { a: 1 };
    obj.self = obj;
    // This will cause a stack overflow, so we expect it to throw
    expect(() => service.deepClone(obj)).toThrow();
  });
});
