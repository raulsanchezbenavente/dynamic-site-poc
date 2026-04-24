import { Provider } from '@angular/core';

import {
  DefaultModalKeyEventStrategy,
  DialogModalKeyEventStrategy,
  DropdownModalKeyEventStrategy,
  DynamicModalKeyEventStrategy,
  MODAL_KEY_EVENT_STRATEGY,
  StationsModalKeyEventStrategy,
} from '../../shared';

export const MODAL_KEY_EVENT_STRATEGIES_PROVIDERS: Provider[] = [
  {
    provide: MODAL_KEY_EVENT_STRATEGY,
    useClass: DefaultModalKeyEventStrategy,
    multi: true,
  },
  {
    provide: MODAL_KEY_EVENT_STRATEGY,
    useClass: DialogModalKeyEventStrategy,
    multi: true,
  },
  {
    provide: MODAL_KEY_EVENT_STRATEGY,
    useClass: DropdownModalKeyEventStrategy,
    multi: true,
  },
  {
    provide: MODAL_KEY_EVENT_STRATEGY,
    useClass: DynamicModalKeyEventStrategy,
    multi: true,
  },
  {
    provide: MODAL_KEY_EVENT_STRATEGY,
    useClass: StationsModalKeyEventStrategy,
    multi: true,
  },
];
