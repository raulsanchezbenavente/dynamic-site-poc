import { ComponentRef } from '@angular/core';

/**
 * Entity used to represent business module registered
 * IBE+
 */
export interface ComposerRegister {
  id: string;
  name: string;
  status: string;
  priority: number;
  isolatedLoading: boolean;
  reference: ComponentRef<unknown>;
}
