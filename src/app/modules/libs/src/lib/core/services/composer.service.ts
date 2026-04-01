import { computed, effect, inject, Injectable, Signal, signal, WritableSignal } from '@angular/core';
import { Observable, Subject } from 'rxjs';

import { ComposerStatusEnum } from '../enums';
import { ComposerEventStatusEnum } from '../enums/composer/composer-event-status.enum';
import { ComposerEventTypeEnum } from '../enums/composer/composer-event-type.enum';
import { ComposerEvent } from '../models/composer/composer-event';
import { ComposerRegister } from '../models/composer/composer-register';

import { ConfigService } from './config.service';
import { LoggerService } from './logger.service';

/**
 * Composer Service allow interactions between components
 * IBE+
 */
@Injectable({
  providedIn: 'root',
})
export class ComposerService {
  public _notifier = new Subject<ComposerEvent>();
  /**
   * Allow subscription to events from ComposerService
   */
  public notifier$: Observable<ComposerEvent> = this._notifier.asObservable();

  /**
   * Signal to notify if a submit request is running - readonly
   */
  public runningSubmit: Signal<boolean> = signal(false);

  /**
   * Signal to notify if a component is loading - readonly
   */
  public componentLoading: Signal<boolean> = signal(true);

  /**
   * Signal to notify if a component is isolated loading - readonly
   */
  public componentIsolatedLoading: Signal<boolean> = signal(true);

  /**
   * Signal to notify current registered components - readonly
   */
  public registerList: Signal<ComposerRegister[]> = signal([]);

  private readonly _composerRegisterSignal: WritableSignal<ComposerRegister[]> = signal([]);
  private readonly _composerSubmitSignal: WritableSignal<ComposerEvent[]> = signal([]);
  private readonly _composerLoadingSignal: WritableSignal<boolean> = signal(true);
  private readonly _composerIsolatedLoadingSignal: WritableSignal<boolean> = signal(true);
  private _timeOutRef!: ReturnType<typeof setTimeout>;

  private readonly _isolatedLoadingComponents = new Map<string, boolean>();
  private readonly _isolatedLoadingComponentsList = signal<string[]>([]);

  // Providers
  /**
   * Constructor - Init Effects and Computed signals
   * @param _loggerService
   */
  private readonly _loggerService = inject(LoggerService);
  private readonly _configService = inject(ConfigService);

  constructor() {
    this.initComposerComputedSignals();
    this.initComposerEffects();
  }

  /**
   * Add Composer register
   * @param register
   */
  public addComposerRegister(register: ComposerRegister): void {
    // Check if already exists before updating
    if (this._composerRegisterSignal().some((reg) => reg.id === register.id)) {
      this._loggerService.warn(
        'ComposerService' + ' - ' + this.addComposerRegister.name,
        'register already exists',
        register
      );
      return;
    }

    // Update register list atomically
    this._composerRegisterSignal.update((value) => {
      const newValue = [...value, register];
      return newValue;
    });

    // Automatically set isolated loading to true if component has isolatedLoading flag
    if (register.isolatedLoading) {
      this.updateIsolatedLoadingStatus(register.id, true);
    }

    // Update loading signal to reflect the new component's loading state
    const hasLoadingComponents = this._composerRegisterSignal().some(
      (reg) => reg.status === ComposerStatusEnum.LOADING && !reg.isolatedLoading
    );
    this._composerLoadingSignal.set(hasLoadingComponents);
  }

  /**
   * Update Composer register
   * @param id
   * @param status
   */
  public updateComposerRegisterStatus(id: string, status: string): void {
    this._composerRegisterSignal.update((value) => {
      const index = value.findIndex((register) => register.id === id);
      if (index === -1) {
        this._loggerService.warn(
          'ComposerService' + ' - ' + this.updateComposerRegisterStatus.name,
          'unknown id register ',
          id
        );
        return value;
      }

      // Create a new array with the updated register to trigger signal change detection
      const newValue = [...value];
      newValue[index] = { ...newValue[index], status };

      // Automatically set isolated loading to false when component is loaded
      if (status === ComposerStatusEnum.LOADED && newValue[index].isolatedLoading) {
        this.updateIsolatedLoadingStatus(id, false);
      }

      return newValue;
    });

    const hasLoadingComponents = this._composerRegisterSignal().some(
      (reg) => reg.status === ComposerStatusEnum.LOADING && !reg.isolatedLoading
    );
    this._composerLoadingSignal.set(hasLoadingComponents);
  }

  /**
   * Create submit requests following array order
   * @param submitIdList list with each UUID of the modules to send
   */
  public submitEvent(submitIdList: string[]): void {
    if (this.runningSubmit()) {
      this._loggerService.warn('ComposerService' + ' - ' + 'submitEvent', 'Submit request in progress ');
      return;
    }
    let composerEventList: ComposerEvent[] = [];
    for (const id of submitIdList) {
      composerEventList.push({
        componentId: id,
        status: ComposerEventStatusEnum.PENDING,
        type: ComposerEventTypeEnum.SubmitRequested,
        priority: this.registerList().find((c) => c.id === id)?.priority,
      });
    }

    // Order
    composerEventList = composerEventList.sort((a, b) => {
      return a.priority! - b.priority!;
    });

    // update signal
    this._composerSubmitSignal.set(composerEventList);

    // notify first
    this.notifyNextSubmit();

    // Timeout...
    this._timeOutRef = setTimeout(() => {
      this._composerSubmitSignal.set([]);
      this._loggerService.warn('ComposerService' + ' - ' + 'submitEvent', 'Submit timeout ');
    }, this._configService.getMainConfig().composerTimeout);
  }

  /**
   * Notify submit event completed from component
   * @param event
   */
  public notifyComposerEvent(event: ComposerEvent): void {
    if (event.type === ComposerEventTypeEnum.SubmitRequested) {
      this._composerSubmitSignal.update((value) => {
        const composerEvent = value.find((e) => e.componentId === event.componentId);
        if (composerEvent) {
          composerEvent.status = event.status;
        } else {
          this._loggerService.warn(
            'ComposerService' + ' - ' + this.notifyComposerEvent.name,
            'unexpected event',
            event
          );
        }

        return [...value];
      });
    } else {
      this._loggerService.warn('ComposerService' + ' - ' + this.notifyComposerEvent.name, 'unknown event type', event);
    }
  }

  /**
   * Update the isolated loading status for a specific component
   */
  public updateIsolatedLoadingStatus(componentId: string, isLoading: boolean): void {
    this._isolatedLoadingComponents.set(componentId, isLoading);
    this.updateIsolatedLoadingSignal();
    this.updateIsolatedLoadingComponentsList();
  }

  /**
   * Remove component from isolated loading tracking
   */
  private removeIsolatedLoadingComponent(componentId: string): void {
    this._isolatedLoadingComponents.delete(componentId);
    this.updateIsolatedLoadingSignal();
  }

  /**
   * Check if any component with data-isolated-loading is currently loading
   */
  private updateIsolatedLoadingSignal(): void {
    const anyLoading = Array.from(this._isolatedLoadingComponents.values()).some(Boolean);
    this._composerIsolatedLoadingSignal.set(anyLoading);
  }

  /**
   * Update the list of components currently loading
   */
  private updateIsolatedLoadingComponentsList(): void {
    const loadingComponents = Array.from(this._isolatedLoadingComponents)
      .filter(([, isLoading]) => isLoading)
      .map(([componentId]) => componentId);

    this._isolatedLoadingComponentsList.set(loadingComponents);
  }

  /**
   * Get signal with list of components currently loading
   */
  public get isolatedLoadingComponentsList(): Signal<string[]> {
    return this._isolatedLoadingComponentsList.asReadonly();
  }

  /**
   * Destroy element
   * @param id
   */
  public destroy(id: string): void {
    const register = this._composerRegisterSignal().find((reg) => reg.id === id);
    if (register) {
      if (register.isolatedLoading) {
        this.removeIsolatedLoadingComponent(id);
      }

      register.reference.destroy();
      this._composerRegisterSignal.update((value) => {
        value = value.filter((reg) => reg.id !== id);
        return value;
      });
    } else {
      this._loggerService.warn('ComposerService' + ' - ' + this.destroy.name, 'unknown element with id:', id);
    }
  }

  public renderAction(): void {
    this._notifier.next({
      componentId: '',
      status: ComposerEventStatusEnum.REQUESTED,
      type: ComposerEventTypeEnum.RenderRequested,
    });
  }

  /**
   * init effects
   */
  private initComposerEffects(): void {
    effect(() => {
      if (this._composerSubmitSignal().length > 0) {
        // Validate error status
        if (this._composerSubmitSignal().some((event) => event.status === ComposerEventStatusEnum.ERROR)) {
          this._loggerService.info(
            'ComposerService' + ' - ' + 'ComposerSubmitEffect',
            'Component has error on submit - Process Stopped',
            this._composerSubmitSignal()
          );
          this._composerSubmitSignal.set([]);
          clearTimeout(this._timeOutRef);
        } else if (!this._composerSubmitSignal().some((e) => e.status === ComposerEventStatusEnum.REQUESTED)) {
          // validate pending status
          const pending = this._composerSubmitSignal().find(
            (event) => event.status === ComposerEventStatusEnum.PENDING
          );
          if (pending) {
            this.notifyNextSubmit();
          } else {
            // Notify Success
            this._loggerService.info(
              'ComposerService' + ' - ' + 'ComposerSubmitEffect',
              'Success Submit',
              this._composerSubmitSignal()
            );
            this._composerSubmitSignal.set([]);
            clearTimeout(this._timeOutRef);
            this._notifier.next({
              componentId: '',
              status: ComposerEventStatusEnum.SUCCESS,
              type: ComposerEventTypeEnum.SubmitFinished,
            });
          }
        }
      } else {
        this._notifier.next({
          componentId: '',
          status: ComposerEventStatusEnum.ERROR,
          type: ComposerEventTypeEnum.SubmitFinished,
        });
      }
    });

    effect(() => {
      if (this._composerRegisterSignal().length > 0) {
        this._loggerService.info(
          'ComposerService' + ' - ' + 'ComposerRegisterEffect',
          'Register Updated',
          this.registerList()
        );
      }
    });
  }

  /**
   * Init Computed Signals
   */
  private initComposerComputedSignals(): void {
    this.runningSubmit = computed(() => this._composerSubmitSignal().length > 0);

    this.registerList = computed(() => this._composerRegisterSignal());

    this.componentLoading = computed(() => this._composerLoadingSignal());
    this.componentIsolatedLoading = computed(() => this._composerIsolatedLoadingSignal());
  }

  /**
   * Notify Next
   */
  private notifyNextSubmit(): void {
    // Filter submit events by pending status
    let pendingEvents = this._composerSubmitSignal().filter(
      (event) => event.status === ComposerEventStatusEnum.PENDING
    );

    // Filter pending submit events by priority group
    if (pendingEvents.length > 0) {
      pendingEvents = pendingEvents.filter((event) => event.priority === pendingEvents[0].priority);
    }

    this._loggerService.info('ComposerService' + ' - ' + 'notifyNextSubmit', 'SubmitGroup', pendingEvents);

    // Update Status and Notify
    for (const event of pendingEvents) {
      this._composerSubmitSignal.update((value) => {
        const composerEvent = value.find((e) => e.componentId === event.componentId);
        if (composerEvent) {
          composerEvent.status = ComposerEventStatusEnum.REQUESTED;
        } else {
          this._loggerService.warn(
            'ComposerService' + ' - ' + this.notifyComposerEvent.name,
            'unexpected event',
            event
          );
        }

        return [...value];
      });

      this._notifier.next(event);
    }
  }
}
