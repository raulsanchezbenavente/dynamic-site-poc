import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class MergeConfigsService {
  public mergeConfigs(target: any, source: any): any {
    target = target ?? {}; // Default to an empty object if null/undefined
    source = source ?? {}; // Default to an empty object if null/undefined

    const mergedObject = { ...target };

    for (const key in source) {
      if (source[key] instanceof Object && key in target) {
        mergedObject[key] = this.mergeConfigs(target[key], source[key]);
      } else {
        mergedObject[key] = source[key];
      }
    }

    return mergedObject;
  }
}
