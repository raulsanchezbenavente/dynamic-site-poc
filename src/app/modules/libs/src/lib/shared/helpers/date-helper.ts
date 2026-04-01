import { NgbDate, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import dayjs from 'dayjs';

import { TimeMeasureModel } from '../model/time-measure.model';

export const dateHelper = {
  addDays,
  addHours,
  addZeroPadding,
  convertDateToIso8601,
  convertDateToNgbDateStruct,
  convertNgbDateStructureToDate,
  convertNgbDateStructToDateType,
  convertNgbDateToDate,
  convertNgbDateStructToDate,
  convertHoursToFullTime,
  convertToApiDate,
  convertToTimespan,
  dateDiff,
  getDateFormated,
  getDiffDays,
  getNumberOfYearsFromTimespan,
  today,
  formatDate,
  convertFromTimespanToMinutes,
  translateShortDayName,
  formatDateToFormatTs,
};

export function today(): Date {
  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);
  return todayDate;
}

/**
 * Get Date - UTC format - deprecated
 * deprecated
 * @param journeyDate date
 */
export function getDateUtcFormated(journeyDate: string | Date): Date {
  const date = new Date(journeyDate);
  return new Date(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCSeconds()
  );
}

export function getDateFormated(journeyDate: string | Date): Date {
  const date = new Date(journeyDate);
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    date.getHours(),
    date.getMinutes(),
    date.getSeconds()
  );
}

export function dateDiff(firstDate: any, lastDate: any) {
  const startDate = new Date(firstDate);
  const endDate = new Date(lastDate);
  const duration = endDate.getTime() - startDate.getTime();
  const hours = Math.floor(duration / (3600 * 1000));
  const minutes = Math.floor(duration / (60 * 1000)) - hours * 60;
  return {
    hours,
    minutes,
  };
}

/**
 * Convert to API Date (YYYY-MM-DD)
 * @param date date
 */
export function convertToApiDate(date: Date): string {
  const data = dayjs(date);
  return date === null ? null! : data.format('YYYY-MM-DD');
}

export function getDiffDays(firstDay: Date, lastDay: Date) {
  firstDay.setHours(0, 0, 0, 0);
  lastDay.setHours(0, 0, 0, 0);
  return Math.floor((lastDay.getTime() - firstDay.getTime()) / (1000 * 3600 * 24));
}

export function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + 1000 * 60 * 60 * 24 * days);
}

export function addHours(date: Date, hours: number): Date {
  return convertDateToIso8601(dayjs(date).add(hours, 'hours').toDate());
}

/**
 * Convert date to ng bootstrap date - deprecated
 * deprecated
 * @param value date
 */
export function convertDateToNgbDateStruct(value: Date | null): any {
  if (value instanceof Date) {
    return {
      year: value.getFullYear(),
      month: value.getMonth() + 1,
      day: value.getDate(),
    };
  }
}

/**
 * Covert ng bootstrap date to Date
 * @param date NgbDateStruct object to convert
 * @returns Date
 */
export function convertNgbDateStructToDateType(date: NgbDateStruct): Date {
  if (date) {
    const newDate = new Date(date.year + '-' + date.month + '-' + date.day);
    newDate.setDate(date.day);
    return newDate;
  } else {
    return new Date();
  }
}

/**
 * Covert ng bootstrap date to Date
 * @param date NgbDate object to convert
 * @returns Date
 */
export function convertNgbDateToDate(ngbDate: NgbDate): Date {
  if (ngbDate instanceof NgbDate) {
    return new Date(ngbDate.year, ngbDate.month - 1, ngbDate.day);
  } else {
    return new Date();
  }
}

/**
 * Covert ng bootstrap date to string
 * @param date NgbDateStruct object to convert
 * @returns string
 */
export function convertNgbDateStructToDate(date: NgbDateStruct): string {
  const dateString = new Date(date.year + '-' + date.month + '-' + date.day);
  return convertToApiDate(dateString);
}

/**
 * Covert ng bootstrap date to string
 * @param date NgbDateStruct object to convert
 * @returns string
 */
export function convertNgbDateStructureToDate(date: NgbDateStruct): string {
  const dateString = new Date(date.year + '-' + date.month + '-' + date.day);
  return convertToApiDate(dateString);
}

/**
 * Convert a Date or String to Iso Date 8601 - (IOS Date)
 * Use instead old functions like "convertDateForIos", "convertStringToDate"
 * @param date string date or Date object
 */
export function convertDateToIso8601(date: string | Date): Date {
  if (date instanceof Date && Number.isNaN(date.getTime())) return undefined!;
  return dayjs(dayjs(date).toISOString()).toDate();
}

/**
 * Translate short day name of the week acording to locale
 * @param date date
 * @param localeName locale name
 */
function translateShortDayName(date: Date, localeName: string): string {
  return date.toLocaleDateString(localeName, { weekday: 'short' });
}

/**
 * Convert the timespan format that comes from API DD.hh:mm:ss
 * @param dateInTimespan timespan DD.hh:mm:ss
 */
export function getNumberOfYearsFromTimespan(dateInTimespan: string) {
  const numberOfDays = dateInTimespan.split('.')[0];
  return Math.floor(Number(numberOfDays) / 365);
}

/**
 * Convert time units into a timespan in format '00:00:00'
 * @param hours Hours
 * @param minutes Minutes
 * @param seconds Seconds
 */
function convertToTimespan(hours: number, minutes: number, seconds: number): string {
  return [
    dateHelper.addZeroPadding(hours),
    dateHelper.addZeroPadding(minutes),
    dateHelper.addZeroPadding(seconds),
  ].join(':');
}

/**
 * Add zeroes to the left to reach the desired length
 * Enforce the value to be a string
 * @param value Number or string to add zeroes to
 * @param desiredLenght The desired lenght of the final string
 */
function addZeroPadding(value: number | string, desiredLenght = 2): string {
  value = value?.toString() || '';
  while (value.length < desiredLenght) {
    value = '0'.concat(value);
  }
  return value;
}

/**
 * Format date dynamically
 * @param date original date
 * @param format date format type
 * documentation format types: https://day.js.org/docs/en/display/format
 */
function formatDate(date: Date, format: string): string {
  return date && format ? dayjs(date).format(format) : null!;
}

/**
 * Convert from timespan to minutes
 * @param timespan HH:mm:ss
 */
function convertFromTimespanToMinutes(timespan: string): number {
  if (timespan) {
    const timespanSplit = timespan.split(':');
    return +timespanSplit[0] * 60 + +timespanSplit[1];
  }
  return 0;
}

function convertHoursToFullTime(hours: number): TimeMeasureModel | null {
  if (!hours) return null;

  const secondsPerHour = 3600;

  const days = Math.floor(hours / 24);
  const hoursLeft = Math.floor(hours % 24);
  const minutes = Math.floor((hours * secondsPerHour) / 60) % 60;
  const seconds = Math.floor((hours * secondsPerHour) % 60);

  return {
    days,
    hours: hoursLeft,
    minutes,
    seconds,
  };
}

function formatDateToFormatTs(date: string, format: string): string {
  if (date && format) {
    const dateOrder = format.toLowerCase().split('/');
    const dateParts = date.split('/');
    if (date.split('-').length == 3) {
      return date;
    } else if (dateOrder.length === 3 && dateParts.length === 3) {
      const dayIndex = dateOrder.findIndex((part) => part.toLowerCase().includes('dd'));
      const monthIndex = dateOrder.findIndex((part) => part.toLowerCase().includes('mm'));

      const day = Number(dateParts[dayIndex]);
      const month = Number(dateParts[monthIndex]);
      const year = Number(dateParts[2]);

      return month + '/' + day + '/' + year;
    }
  }
  return '';
}
