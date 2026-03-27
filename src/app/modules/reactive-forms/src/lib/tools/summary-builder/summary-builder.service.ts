import { inject, Injectable } from '@angular/core';
import { SummaryDataRenderer } from '@dcx/ui/design-system';
import { CultureServiceEx, EnumSeparators, TextHelperService } from '@dcx/ui/libs';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import 'dayjs/locale/fr';
import 'dayjs/locale/pt';

import { RfListOption } from '../../components/rf-list/models/rf-list-option.model';
import { RfFormControl } from '../../extensions/components/rf-form-control.component';
import { RfFormGroup } from '../../extensions/components/rf-form-group.component';
import { RfFormBuilderComponent } from '../../form-builder/rf-form-builder/rf-form-builder.component';

import { DATEPICKER_COMPONENTS, UNIQUE_COMPONENTS } from './constants/summary-special-cases.constant';
import { SummaryBuilderAddition, SummaryBuilderAdditions } from './models/summary-builder-addition.model';

@Injectable({
  providedIn: 'root',
})
export class SummaryBuilderService {
  private _form!: RfFormGroup;
  private readonly cultureServiceEx = inject(CultureServiceEx);
  private readonly textHelperService = inject(TextHelperService);

  constructor() {
    dayjs.locale(this.cultureServiceEx.getCulture());
  }

  private getLabelsFromSelectedValues(parsedValue: any, rfComponent: any): string {
    if (!Array.isArray(rfComponent)) {
      return String(parsedValue);
    }

    const values = Array.isArray(parsedValue) ? parsedValue : [parsedValue];
    const labels = this.mapValuesToLabels(values, rfComponent);

    return labels.length > 0 ? labels.join(', ') : String(parsedValue);
  }

  private mapValuesToLabels(values: string[], components: any[]): string[] {
    return values.reduce<string[]>((acc, val) => {
      const match = components.find((c) => typeof c.value === 'function' && c.value() === val);

      if (match) {
        const label = typeof match.label === 'function' ? match.label() : '';
        if (label) acc.push(label);
      }

      return acc;
    }, []);
  }

  private isDateRange(value: any): value is { startDate: any; endDate: any } {
    return value && typeof value === 'object' && 'startDate' in value && 'endDate' in value;
  }

  private isDayjsObject(value: any): boolean {
    return value && typeof value.format === 'function' && '$isDayjsObject' in value;
  }

  private getSummaryDataFromStrategy(form: RfFormGroup, rawValue: any, key: string): { label: string; value: string } {
    const rfComponent = (form.controls[key] as RfFormControl)?.rfComponent;
    const rfTypeClass = Array.isArray(rfComponent) ? rfComponent[0]?.rfTypeClass : rfComponent?.rfTypeClass;

    if (!rfTypeClass) return rawValue[key];

    return this.getStrategy(rfTypeClass, rawValue, key, rfComponent);
  }

  private parseDatepicker(parsedValue: any, key: string, rfComponent: any): { label: string; value: string } {
    //Update to a dynamic strategy from country when implementing CMS
    let dateValue = '';
    if (this.isDateRange(parsedValue)) {
      dateValue = `${parsedValue.startDate.format('MMMM D,YYYY')} - ${parsedValue.endDate.format('MMMM D,YYYY')}`;
    } else if (this.isDayjsObject(parsedValue)) {
      dateValue = parsedValue.format(this.cultureServiceEx.getUserCulture().longDateFormat);
    }

    const label = this.resolveLabel(rfComponent.animatedLabel, rfComponent.title, key);
    return { value: dateValue, label };
  }

  private parseCheckbox(parsedValue: any[], key: string, rfComponent: any): { label: string; value: string } {
    const value = parsedValue.length > 0 ? this.getLabelsFromSelectedValues(parsedValue, rfComponent) : '';
    const label = this.resolveLabel(rfComponent[0]?.legend, null, key);
    return { value, label };
  }

  private parseRadio(parsedValue: any, key: string, rfComponent: any): { label: string; value: string } {
    const hasValue = parsedValue !== null && parsedValue !== undefined && parsedValue !== '';
    const value = hasValue ? this.getLabelsFromSelectedValues(parsedValue, rfComponent) : '';
    const label = this.resolveLabel(rfComponent[0]?.legend, null, key);
    return { value, label };
  }

  private parseSelect(parsedValue: any, key: string, rfComponent: any): { label: string; value: string } {
    let value = '';
    const { options } = rfComponent;

    if (typeof options === 'function') {
      const option = options().find((opt: RfListOption) => opt.value === parsedValue);
      value = option?.content ?? '';
    } else {
      value = this.getLabelsFromSelectedValues(parsedValue, rfComponent);
    }

    const label = this.resolveLabel(rfComponent.animatedLabel, null, key);
    return { value, label };
  }

  private parsePhone(parsedValue: any, key: string, rfComponent: any): { label: string; value: string } {
    const prefix: string = parsedValue?.prefix?.replace(/-.*$/, '');
    const value = this.textHelperService.concatValidParts([prefix ?? '', parsedValue?.phone ?? '']);
    const label = this.resolveLabel(rfComponent.title, null, key);
    return { value: value || EnumSeparators.DASH, label };
  }

  private parseDefault(parsedValue: any, key: string, rfComponent: any): { label: string; value: string } {
    const hasValue = parsedValue !== null && parsedValue !== undefined && parsedValue !== '';
    const value = hasValue ? this.getLabelsFromSelectedValues(parsedValue, rfComponent) : '';
    const label = this.resolveLabel(rfComponent.animatedLabel, rfComponent.label, key);
    return { value, label };
  }

  private resolveLabel(fn1?: (() => string) | null, fn2?: (() => string) | null, fallback: string = ''): string {
    if (typeof fn1 === 'function') return fn1();
    if (typeof fn2 === 'function') return fn2();
    return fallback;
  }

  private getStrategy(
    rfTypeClass: string,
    rawValue: any,
    key: string,
    rfComponent: any
  ): { label: string; value: string } {
    const parsedValue = rawValue[key];

    if (DATEPICKER_COMPONENTS.includes(rfTypeClass)) {
      return this.parseDatepicker(parsedValue, key, rfComponent);
    }

    switch (rfTypeClass) {
      case UNIQUE_COMPONENTS.checkbox:
        return this.parseCheckbox(parsedValue, key, rfComponent);

      case UNIQUE_COMPONENTS.radio:
        return this.parseRadio(parsedValue, key, rfComponent);

      case UNIQUE_COMPONENTS.select:
        return this.parseSelect(parsedValue, key, rfComponent);

      case UNIQUE_COMPONENTS.prefixPhone:
        return this.parsePhone(parsedValue, key, rfComponent);

      default:
        return this.parseDefault(parsedValue, key, rfComponent);
    }
  }

  public calculateConfig(
    form: RfFormGroup | RfFormBuilderComponent,
    additions: SummaryBuilderAdditions,
    subtractions: string[]
  ): Record<string, SummaryDataRenderer> {
    this.setForm(form);
    const rawValue = this._form?.getRawValue();
    const summary = this.buildBaseSummary(rawValue);
    const entries = Object.entries(summary);

    this.applyAdditions(entries, additions, rawValue);

    const summaryWithAdditions = Object.fromEntries(entries);

    this.applySubtractions(summaryWithAdditions, subtractions);
    return summaryWithAdditions;
  }

  private setForm(form: RfFormGroup | RfFormBuilderComponent): void {
    if (form instanceof RfFormBuilderComponent) {
      this._form = form.form as RfFormGroup;
      return;
    }

    if (form instanceof RfFormGroup) {
      this._form = form;
    }
  }

  private buildBaseSummary(rawValue: Record<string, unknown>): Record<string, SummaryDataRenderer> {
    const summary: Record<string, SummaryDataRenderer> = {};

    for (const key in rawValue) {
      if (!rawValue.hasOwnProperty(key)) continue;
      summary[key] = this.getSummaryDataFromStrategy(this._form, rawValue, key);
    }

    return summary;
  }

  private applyAdditions(
    entries: [string, SummaryDataRenderer][],
    additions: SummaryBuilderAdditions,
    rawValue: Record<string, unknown>
  ): void {
    if (!additions) return;

    for (const key in additions) {
      if (!additions.hasOwnProperty(key)) continue;

      const addition = additions[key];
      const pair = this.createAdditionPair(key, addition, rawValue);
      this.insertAdditionPair(entries, pair, addition);
    }
  }

  private createAdditionPair(
    key: string,
    addition: SummaryBuilderAddition,
    rawValue: Record<string, unknown>
  ): [string, { label: string; value: string }] {
    const computedLabel = addition?.label ? addition.label(rawValue) : key;
    const computedValue = addition?.value ? addition.value(rawValue) : '';

    return [
      key,
      {
        label: computedLabel == null ? key : String(computedLabel),
        value: computedValue == null ? '' : String(computedValue),
      },
    ];
  }

  private insertAdditionPair(
    entries: [string, SummaryDataRenderer][],
    pair: [string, SummaryDataRenderer],
    addition: SummaryBuilderAddition
  ): void {
    if (!addition.position) {
      entries.push(pair);
      return;
    }

    const targetIndex = entries.findIndex(([k]) => k === addition.position?.key);

    if (targetIndex < 0) {
      entries.push(pair);
      return;
    }

    const insertIndex = addition.position.after ? targetIndex + 1 : targetIndex;
    entries.splice(insertIndex, 0, pair);
  }

  private applySubtractions(summary: Record<string, SummaryDataRenderer>, subtractions: string[]): void {
    if (!subtractions) return;

    for (const key of subtractions) {
      if (summary.hasOwnProperty(key)) {
        delete summary[key];
      }
    }
  }
}
