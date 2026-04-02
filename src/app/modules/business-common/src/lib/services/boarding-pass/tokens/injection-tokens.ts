import { inject, InjectionToken } from '@angular/core';

import {
  BoardingPassVMBuilderService,
  IBoardingPassVMBuilder,
  IProcessBoardingPass,
  ProcessBoardingPassAppleWalletService,
  ProcessBoardingPassGooglePayService,
  ProcessBoardingPassPdfService,
} from '..';

export const BOARDING_PASS_VM_BUILDER_SERVICE = new InjectionToken<IBoardingPassVMBuilder>(
  'BOARDING_PASS_VM_BUILDER_SERVICE',
  {
    providedIn: 'root',
    factory: (): IBoardingPassVMBuilder => inject(BoardingPassVMBuilderService),
  }
);

export const PROCESS_BOARDING_PASS_SERVICE = new InjectionToken<IProcessBoardingPass[]>(
  'PROCESS_BOARDING_PASS_SERVICE',
  {
    providedIn: 'root',
    factory: (): IProcessBoardingPass[] => [
      inject(ProcessBoardingPassPdfService),
      inject(ProcessBoardingPassAppleWalletService),
      inject(ProcessBoardingPassGooglePayService),
    ],
  }
);
