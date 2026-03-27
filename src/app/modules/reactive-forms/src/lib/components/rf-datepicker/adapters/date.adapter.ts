import { Injectable } from '@angular/core';
import { NgbDateAdapter, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import dayjs, { Dayjs } from 'dayjs';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);

@Injectable({
  providedIn: 'root',
})
export class DateAdapter extends NgbDateAdapter<Dayjs> {
  public fromModel(date: Dayjs | null): NgbDateStruct | null {
    if (!date?.isValid()) {
      return null;
    }

    const utcDate = date.utc();

    return {
      year: utcDate.year(),
      month: utcDate.month() + 1,
      day: utcDate.date(),
    };
  }

  public toModel(date: NgbDateStruct | null): Dayjs | null {
    if (!date) {
      return null;
    }

    const dayjsDate = dayjs
      .utc()
      .year(date.year)
      .month(date.month - 1)
      .date(date.day)
      .hour(0)
      .minute(0)
      .second(0)
      .millisecond(0);

    return dayjsDate.isValid() ? dayjsDate : null;
  }
}
