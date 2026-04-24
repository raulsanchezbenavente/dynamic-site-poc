export const currencyFormatHelper = {
  integerOnly,
  fractionalOnly,
};

function integerOnly(value: number, culture: string, minAndMax = 20): string {
  let resultNumber = '';
  resultNumber = value.toLocaleString(culture, { minimumFractionDigits: minAndMax, maximumFractionDigits: minAndMax });
  resultNumber = resultNumber.substring(0, resultNumber.length - (minAndMax + 1));
  return resultNumber;
}

function fractionalOnly(value: number, culture: string, numberDecimals: number, minAndMax = 20): string {
  let resultNumber = '';
  if (numberDecimals !== 0) {
    resultNumber = value.toLocaleString(culture, {
      minimumFractionDigits: minAndMax,
      maximumFractionDigits: minAndMax,
    });
    resultNumber = resultNumber.substring(
      resultNumber.length - (minAndMax + 1),
      resultNumber.length - (minAndMax - numberDecimals)
    );
  }
  return resultNumber;
}
