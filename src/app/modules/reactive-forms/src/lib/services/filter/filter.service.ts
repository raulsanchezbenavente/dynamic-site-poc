import { inject, Injectable, SecurityContext } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

import { RfListOption } from '../../components/rf-list/models/rf-list-option.model';

import { RfFilterType } from './filter.enum';
import { RfOptionsFilter } from './filter.model';

@Injectable({
  providedIn: 'root',
})
export class FilterService {
  private readonly sanitizer = inject(DomSanitizer);

  constructor() {}

  public filter(filterType: RfOptionsFilter, options: RfListOption[], filterValue: string): RfListOption[] {
    const method: RfFilterType = filterType?.type || RfFilterType.NORMAL;
    return this.strategies[method](options, filterValue);
  }

  private readonly normalizeWithTrim = (str: string): string =>
    str
      .normalize('NFD')
      .replaceAll(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();

  private readonly normalizeWithoutTrim = (str: string): string =>
    str
      .normalize('NFD')
      .replaceAll(/[\u0300-\u036f]/g, '')
      .toLowerCase();

  public readonly strategies = {
    [RfFilterType.NORMAL]: (options: RfListOption[], filterValue: string): RfListOption[] => {
      const filterValueNormalized = this.normalizeWithTrim(filterValue);
      return options?.filter((o) =>
        this.normalizeWithTrim(o.content as unknown as string).includes(filterValueNormalized)
      );
    },
    [RfFilterType.MARKED]: (options: RfListOption[], filterValue: string): RfListOption[] => {
      const query = this.normalizeWithTrim(filterValue || '');

      return options
        ?.filter((o) => {
          const text = (o.content as string).replaceAll(/<[^>]*>/g, '');
          return this.normalizeWithTrim(text).includes(query);
        })
        .map((o) => ({
          ...o,
          content: this.highlightMatch(o.content, filterValue),
        }));
    },
  };
  private getIndexes(
    plainText: string,
    matchIndex: number,
    normalizedQuery: string
  ): { originalStart: number; originalEnd: number } {
    let visibleIndex = 0;
    let originalStart = -1;
    let originalEnd = -1;
    for (let i = 0; i < plainText.length; i++) {
      const currentChar = plainText[i];
      const normalizedChar = this.normalizeWithoutTrim(currentChar);
      if (visibleIndex === matchIndex && originalStart === -1) {
        originalStart = i;
      }
      if (visibleIndex === matchIndex + normalizedQuery.length - 1 && originalEnd === -1) {
        originalEnd = i + 1;
        break;
      }
      visibleIndex += normalizedChar.length;
    }
    return {
      originalStart,
      originalEnd,
    };
  }

  private getMarkedMatch(html: string, originalStart: number, originalEnd: number): string {
    let marked: string = '';
    let indexInPlain: number = 0;
    const regex: RegExp = /(<[^>]*>|[^<]+)/g;
    let match = regex.exec(html);

    while (match) {
      const chunk = match[0];
      if (chunk.startsWith('<')) {
        marked += chunk;
      } else {
        const chunkEnd = indexInPlain + chunk.length;
        if (indexInPlain <= originalStart && chunkEnd >= originalEnd) {
          const localStart = originalStart - indexInPlain;
          const localEnd = originalEnd - indexInPlain;
          marked +=
            chunk.slice(0, localStart) +
            `<mark class="list-filter-marked">${chunk.slice(localStart, localEnd)}</mark>` +
            chunk.slice(localEnd);
        } else {
          marked += chunk;
        }
        indexInPlain = chunkEnd;
      }
      match = regex.exec(html);
    }
    return marked;
  }

  private highlightMatch(safeHtml: SafeHtml, query: string): SafeHtml {
    if (!query?.trim()) return safeHtml;
    const html: string = this.sanitizer.sanitize(SecurityContext.HTML, safeHtml) ?? '';
    const plainText = html.replaceAll(/<[^>]*>/g, '');
    const normalizedPlain = this.normalizeWithoutTrim(plainText);
    const normalizedQuery = this.normalizeWithoutTrim(query.trim());
    const matchIndex = normalizedPlain.indexOf(normalizedQuery);
    if (matchIndex === -1) return safeHtml;
    const { originalStart, originalEnd } = this.getIndexes(plainText, matchIndex, normalizedQuery);
    if (originalStart === -1 || originalEnd === -1) return safeHtml;
    return this.getMarkedMatch(html, originalStart, originalEnd);
  }
}
