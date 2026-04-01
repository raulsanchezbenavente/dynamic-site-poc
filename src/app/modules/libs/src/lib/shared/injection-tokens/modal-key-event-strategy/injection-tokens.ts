import { InjectionToken } from '@angular/core';

import { IModalKeyEventStrategy } from '../../interfaces/modal-key-event-strategy.interface';

export const MODAL_KEY_EVENT_STRATEGY = new InjectionToken<IModalKeyEventStrategy>('MODAL_KEY_EVENT_TYPE_STRATEGY');
