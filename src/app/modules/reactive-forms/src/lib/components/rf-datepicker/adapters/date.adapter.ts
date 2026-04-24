import { Injectable } from '@angular/core';
import { NgbDateAdapter, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';

import { ShortDate } from '../../../common/short-date.interface';

@Injectable({
  providedIn: 'root',
})
export class DateAdapter extends NgbDateAdapter<ShortDate> {
  public fromModel(date: ShortDate | null): NgbDateStruct | null {
    if (!date?.year || !date?.month || !date?.day) {
      return null;
    }

    return {
      year: date.year,
      month: date.month,
      day: date.day,
    };
  }

  public toModel(date: NgbDateStruct | null): ShortDate | null {
    if (!date) {
      return null;
    }

    return {
      day: date.day,
      month: date.month,
      year: date.year,
    };
  }
}
