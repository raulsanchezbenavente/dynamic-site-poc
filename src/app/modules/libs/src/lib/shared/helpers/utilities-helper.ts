import { BookingFee } from '../model';
import { SessionData } from '../session';

import { MaxMinValue } from './../model/max-min-value';

// clone objects with arrays
export function clone(obj: any): any {
  if (!obj) {
    return obj;
  }
  return structuredClone(obj);
}

// Entering numbers is prevented by default
export function preventDefaultWhenIsNumber(event: KeyboardEvent): boolean {
  const key = event.key;
  if (/\d/.test(key)) {
    event.preventDefault();
    return false;
  } else {
    return true;
  }
}

export function AddFee(amount: number, feeCode: string, sessionData: SessionData): void {
  if (sessionData?.session?.booking) {
    let result: BookingFee;
    let amountToUpdate = 0;

    if (sessionData.session.booking.bookingFees) {
      if (
        sessionData.session.booking.bookingFees.length === 0 ||
        !sessionData.session.booking.bookingFees.some((x: any) => x.feeCode.toUpperCase() === feeCode)
      ) {
        amountToUpdate = amount;
        sessionData.session.booking.bookingFees.push({
          feeCode,
          charges: [
            {
              amount,
              code: feeCode,
            },
          ],
          segmentId: '',
        });
      } else {
        result = sessionData.session.booking.bookingFees.find((x: any) => x.feeCode.toUpperCase() === feeCode)!;
        amountToUpdate = amount - result.charges![0].amount!;
        result.charges![0].amount = amount;
      }
    }
    sessionData.session.bookingFee = {
      feeCode,
      charges: [
        {
          amount,
          code: feeCode,
        },
      ],
      segmentId: '',
    };

    sessionData.session.booking.pricing.totalAmount += amountToUpdate;
  }
}

/**
 * Extract the min and max length values from a regex. Takes the first length delimiter from the regex
 * @param regex Regex to extract the value from
 * @returns number representing the max length
 */
export function extractMaxAndMinValueFromRegex(
  regex: string,
  minValue: number = 5,
  maxValue: number = 16
): MaxMinValue {
  const result: MaxMinValue = {
    min: minValue,
    max: maxValue,
  };

  const substring = regex.substring(regex.indexOf('{') + 1, regex.indexOf('}'));
  if (substring) {
    if (substring.split(',').length > 1) {
      result.min = +substring.split(',')[0];
      result.max = +substring.split(',')[1];
    } else {
      result.min = +substring.split(',')[0];
    }
  }
  return result;
}

export const UtilitiesHelper = {
  clone,
  preventDefaultWhenIsNumber,
  AddFee,
  extractMaxAndMinValueFromRegex,
};
