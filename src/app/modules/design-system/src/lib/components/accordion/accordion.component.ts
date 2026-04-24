import { Component, ElementRef, OnInit, signal } from '@angular/core';
import {
  CommonConfig,
  ComposerEvent,
  ComposerEventStatusEnum,
  ComposerEventTypeEnum,
  ComposerService,
  ComposerStatusEnum,
  ConfigService,
  DataModule,
  LoggerService,
} from '@dcx/ui/libs';
import { filter, forkJoin, Observable, Subscription, tap } from 'rxjs';

import { AccordionItemComponent } from './components/accordion-item/accordion-item.component';
import { AccordionItemConfig } from './models/accordion-item.config';
import { AccordionConfig } from './models/accordion.config';

@Component({
  selector: 'ds-accordion',
  templateUrl: './accordion.component.html',
  styleUrls: ['./styles/accordion.styles.scss'],
  host: { class: 'ds-accordion' },
  imports: [AccordionItemComponent],
  standalone: true,
})
export class AccordionComponent implements OnInit {
  public isLoaded = signal(false);
  public groupConfig = signal<AccordionItemConfig[]>([]);
  protected data!: DataModule;

  constructor(
    protected elementRef: ElementRef,
    protected configService: ConfigService,
    protected composer: ComposerService,
    protected logger: LoggerService
  ) {
    this.data = this.configService.getDataModuleId(this.elementRef);
  }

  public ngOnInit(): void {
    setTimeout(() => {
      this.scrollToElement();
    });
    forkJoin([this.initConfig(), this.getBusinessConfig()]).subscribe(() => {
      this.subscribeComposerNotifier();
      this.composer.updateComposerRegisterStatus(this.data.id, ComposerStatusEnum.LOADED);
      this.isLoaded.set(true);
    });
  }

  /**
   * Move the screen scroll position so that header when fixed on top does not cover the accordion title
   */
  protected scrollToElement(): void {
    const fragment = globalThis.location.hash;
    if (fragment) {
      const elementId = fragment.substring(1);
      const element = document.getElementById(elementId);
      if (element) {
        const headerElement = document.getElementById('mainHeaderDiv');
        if (headerElement) {
          const headerStyles = globalThis.getComputedStyle(headerElement);
          const headerHeight = Number.parseInt(headerStyles.height, 10);
          const newPosition = element.offsetTop - headerHeight;
          globalThis.scrollTo({ top: newPosition });
        }
      }
    }
  }

  /**
   * Initializes the configuration of the AccordionItemComponent component.
   * This function is responsible for obtaining the configuration of the business module and making
   * the necessary calls to obtain the translation configuration and the common configuration.
   * @returns An Observable that is populated once configuration initialization has completed.
   */
  protected initConfig(): Observable<unknown> {
    return this.configService.getBusinessModuleConfig<AccordionConfig>(this.data.config).pipe(
      tap((config) => {
        this.groupConfig.set(this.getConfigs(config));
        this.logger.info('AccordionComponent', 'Module config', this.groupConfig());
      })
    );
  }

  /**
   * Subscribes to the `notifier$` Observable of the `composer` object.
   * This function filters the events based on the type and componentId,
   * and then updates the status of the event to SUCCESS before notifying the composer.
   * @returns An Observable that completes once the subscription is set up.
   */
  protected subscribeComposerNotifier(): Subscription {
    return this.composer.notifier$
      .pipe(
        filter((e: ComposerEvent) => e.type === ComposerEventTypeEnum.SubmitRequested && e.componentId === this.data.id)
      )
      .subscribe((event: ComposerEvent) => {
        event.status = ComposerEventStatusEnum.SUCCESS;
        this.composer.notifyComposerEvent(event);
      });
  }

  /**
   * Retrieves the business configuration.
   * This method fetches the common business configuration using the ConfigService and logs the configuration.
   * @returns An Observable that emits the business configuration once it is retrieved.
   */
  protected getBusinessConfig(): Observable<unknown> {
    return this.configService.getCommonConfig(CommonConfig.BUSINESS_CONFIG).pipe(
      tap((config) => {
        this.logger.info('AccordionComponent', 'Business config', config);
      })
    );
  }

  /**
   * Retrieves the business configuration.
   * This method fetches the common business configuration using the ConfigService and logs the configuration.
   * @returns An Observable that emits the business configuration once it is retrieved.
   */
  protected getConfigs(accordions: AccordionConfig): AccordionItemConfig[] {
    return accordions.items.flatMap((item) =>
      item.elements.map((element) => ({
        id: element.id ?? '',
        title: element.title ?? '',
        itemContent: element.itemContent ?? '',
        startOpen: element.startOpen ?? false,
      }))
    );
  }
}
