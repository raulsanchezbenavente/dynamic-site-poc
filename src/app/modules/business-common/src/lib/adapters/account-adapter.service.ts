import { AccountV2Models } from '@dcx/module/api-clients';

import { CustomerAccount, CustomerProgram } from '../models';

/**
 * Adapter for converting API responses to domain models.
 */
export class AccountAdapter {
  public static adaptSessionResponse(accountDto: AccountV2Models.AccountDto): CustomerAccount | null {
    if (!accountDto) {
      return null;
    }
    return this.mapToDomain(accountDto);
  }

  private static mapToDomain(accountDto: AccountV2Models.AccountDto): CustomerAccount {
    const customerPrograms: Record<string, CustomerProgram> = {};

    if (accountDto.customerPrograms) {
      for (const key of Object.keys(accountDto.customerPrograms)) {
        const program = accountDto.customerPrograms[key];
        customerPrograms[key] = {
          programNumber: program.programNumber ?? '',
          tier: program.tier ?? '',
        };
      }
    }

    return {
      firstName: accountDto.firstName ?? '',
      middleName: accountDto.middleName,
      lastName: accountDto.lastName ?? '',
      username: accountDto.username,
      customerNumber: accountDto.customerNumber,
      dateOfBirth: accountDto.dateOfBirth,
      balance: {
        lifemiles: {
          amount: accountDto.balance?.lifemiles?.amount ?? 0,
          expiryDate: accountDto.balance?.lifemiles?.expiryDate,
        },
      },
      customerPrograms,
      eliteProgress: accountDto.eliteProgress,
    };
  }
}
