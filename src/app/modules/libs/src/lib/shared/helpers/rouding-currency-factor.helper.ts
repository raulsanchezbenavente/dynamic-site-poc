import { BusinessConfig } from '../model';

export const roundingCurrencyFactorHelper = {
  getRoundingCurrencyFactor,
};

/**
 * get the mount decimals by currency factor
 * @param currencyCode currency code
 * @returns number of decimals found by currency factor
 */
function getRoundingCurrencyFactor(currencyCode: string, businessConfig: BusinessConfig): number {
  const roundingCurrencyFactors = businessConfig.roundingCurrencyFactors as [{ code: string; factor: string }];
  const foundRoundingCurrencyFactor = roundingCurrencyFactors.find(
    (roudingCurrency) => roudingCurrency.code === currencyCode
  );
  if (foundRoundingCurrencyFactor) {
    const factor = foundRoundingCurrencyFactor.factor.split('.')[1];
    return factor ? factor.length : 0;
  }
  return 2;
}
