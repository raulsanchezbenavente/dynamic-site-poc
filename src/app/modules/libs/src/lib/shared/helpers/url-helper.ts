import { DictionaryType } from '../model';

function getParams(encodedUrl: string, valueToUpperCase: boolean = true): object {
  const result = {} as DictionaryType<string>;
  const url = decodeURIComponent(encodedUrl);
  if (url.split('?')[1]) {
    const params = url.split('?')[1].split('&');
    for (const p of params) {
      const paramKey = p.split('=')[0].toString().toLowerCase();
      const paramHasValue = p.split('=').length > 1;
      let paramValue = '';

      if (paramHasValue) {
        paramValue = valueToUpperCase ? getUpperCaseValue(p) : getLowerCaseValue(p);
      }

      result[paramKey] = paramValue;
    }
    return result;
  } else {
    return {};
  }
}

export function getUpperCaseValue(p: string): string {
  return p.split('=')[1].toUpperCase();
}

export function getLowerCaseValue(p: string): string {
  return p.split('=')[1];
}

function getCultureFromCurrentUrl(): string {
  const regex = /\/[a-z]{2}(?:-[A-Z]{2}\b)?(?!\.)/i;
  const curUrl = globalThis.location.href;
  const curCulture = regex.exec(curUrl);
  if (curCulture && curCulture.length > 0) {
    return curCulture[0].replace('/', '');
  } else {
    return 'en-US';
  }
}

function getParameterByName(name: any, url: any): string | null {
  url ??= globalThis.location.href;
  name = name.replaceAll(/[[\]]/g, String.raw`\$&`);
  const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)');
  const results = regex.exec(url);
  if (!results) {
    return null;
  }
  if (!results[2]) {
    return '';
  }
  return decodeURIComponent(results[2].replaceAll('+', ' '));
}

function getPathSegmentsName(pathName: string): string {
  const segments = pathName.split('/').filter((segment) => segment.length > 0);
  if (segments.length <= 1) {
    return '';
  }

  const joinedSegments = segments.slice(1).join('-');
  return `-${joinedSegments}`;
}

function getOrigin(): string {
  return globalThis.location.origin;
}

function updateUrlParameter(parameterName: string, parameterValue: string): void {
  const currentUrl = new URL(globalThis.location.href);

  if (parameterValue && currentUrl.searchParams.has(parameterName)) {
    currentUrl.searchParams.set(parameterName, parameterValue);
    const newPath = currentUrl.pathname + currentUrl.search;
    globalThis.history.pushState({}, '', newPath);
  }
}

export const urlHelpers = {
  getParams,
  getCultureFromCurrentUrl,
  getParameterByName,
  getOrigin,
  getPathSegmentsName,
  updateUrlParameter,
};
