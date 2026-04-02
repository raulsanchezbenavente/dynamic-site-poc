import { inject, Injectable } from '@angular/core';
import { LoyaltyProgramsFacade } from '@dcx/module/api-clients';
import { CultureServiceEx, CurrencyFormatPipe, CurrencyService } from '@dcx/ui/libs';
import { map, Observable, of } from 'rxjs';

import { CustomerAccount, CustomerBalance, LoyaltyAccountData, LoyaltyProgramTier } from '../../models';

@Injectable({
  providedIn: 'root',
})
export class CustomerLoyaltyService {
  private readonly currencyFormat = inject(CurrencyFormatPipe);
  private readonly currencyService = inject(CurrencyService);
  private readonly cultureService = inject(CultureServiceEx);
  private readonly loyaltyProgramFacade = inject(LoyaltyProgramsFacade);

  /**
   * Extracts customer program information from account data.
   * Iterates through all customer programs and returns the tier information.
   * @param accountDto Account data containing customer programs
   * @returns Observable with tierName, loyaltyId, mainColor, and darkerColor
   */
  public getCustomerProgramData(accountDto: CustomerAccount): Observable<LoyaltyAccountData> {
    const defaultResult: LoyaltyAccountData = {
      tierName: '',
      loyaltyId: '',
      mainColor: '',
      darkerColor: '',
    };

    if (!accountDto.customerPrograms || !accountDto.eliteProgress?.status) {
      return of(defaultResult);
    }

    const accountProgram = Object.values(accountDto.customerPrograms).find((program) => !!program?.tier);
    const tierCode = accountDto.eliteProgress.status ?? '';

    return this.loyaltyProgramFacade.getLoyaltyPrograms().pipe(
      map((cmsProgram) => {
        const foundProgramTier = this.findMatchingProgramTier(cmsProgram?.items, tierCode);

        return {
          tierName: foundProgramTier?.tierName ?? '',
          loyaltyId: accountProgram?.programNumber ?? '',
          mainColor: foundProgramTier?.mainColor ?? '',
          darkerColor: foundProgramTier?.darkerColor ?? '',
        };
      })
    );
  }

  /**
   * Finds the best matching CMS loyalty program tier for a given account tier.
   * First tries an exact normalized match, then falls back to a "contains" check.
   * Normalization converts to lowercase.
   * @param items CMS loyalty program tiers list
   * @param accountTier Account tier string (e.g. 'gold', 'cenitgold', 'diamondone')
   * @returns The matching LoyaltyProgramTier or undefined
   */
  private findMatchingProgramTier(
    items: LoyaltyProgramTier[] | undefined,
    accountTier: string
  ): LoyaltyProgramTier | undefined {
    if (!items?.length || !accountTier) {
      return undefined;
    }

    const normalizedAccountTier = accountTier.toLowerCase();

    return items.find((p) => (p.tierCode ?? '').toLowerCase() === normalizedAccountTier);
  }

  /**
   * Formats loyalty points (lifemiles) amount to a readable string format.
   * @param amount Lifemiles amount to format
   * @returns Formatted string with integer-only display
   */
  public formatLoyaltyPoints(amount: string | number | undefined): string {
    return this.currencyFormat.transform(
      amount ?? '',
      'IntegerOnly',
      this.currencyService.getCurrentCurrency(),
      this.cultureService.getCulture(),
      0
    );
  }

  /**
   * Formats loyalty balance from account balance data.
   * @param balance Balance DTO containing lifemiles information
   * @returns Formatted lifemiles amount
   */
  public formatLoyaltyBalance(balance: CustomerBalance | undefined): string {
    return this.formatLoyaltyPoints(balance?.lifemiles?.amount);
  }
}
