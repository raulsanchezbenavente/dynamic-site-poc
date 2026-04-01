import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DeepCloneService {
  /**
   * Deeply clones an object, preserving classes and regular expressions.
   * @param obj The object to clone.
   * @returns A deep copy of the object.
   * Primitive value, return directly
   * It Handles RegExp instances
   * If the object is an array, recursively clone each element
   * If the object is an instance of a class, clone the instance
   */
  public deepClone<T>(obj: T): T {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }

    if (obj instanceof RegExp) {
      return new RegExp(obj.source, obj.flags) as unknown as T;
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => this.deepClone(item)) as unknown as T;
    }

    const clone = Object.create(Object.getPrototypeOf(obj));

    for (const key of Object.keys(obj)) {
      const value = (obj as any)[key];
      clone[key] = this.deepClone(value);
    }

    return clone as T;
  }
}
