import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  OnInit,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AvailableOptionService,
  DsGroupOptionsComponent,
  DsTitleHeadingComponent,
  GroupOptionElementData,
  GroupOptionsEventService,
  TitleHeading,
} from '@dcx/ui/design-system';
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
import { TranslateModule } from '@ngx-translate/core';
import { filter, forkJoin, Observable, tap } from 'rxjs';

import { GroupOptionsMapper } from './mappers/group-options.mapper';
import { GroupOptionsConfig } from './models/group-options-config.model';

@Component({
  selector: 'group-options',
  templateUrl: './group-options.component.html',
  styleUrls: ['./styles/group-options.styles.scss'],
  host: { class: 'group-options' },
  imports: [TranslateModule, DsGroupOptionsComponent, DsTitleHeadingComponent],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class GroupOptionsComponent implements OnInit {
  public readonly isLoaded = signal<boolean>(false);
  public readonly config = signal<GroupOptionsConfig | undefined>(undefined);
  public readonly isVisible = signal<boolean>(false);
  public readonly filteredOptions = signal<GroupOptionElementData[]>([]);
  public readonly titleConfig = computed(() => {
    const configData = this.config();
    const model = configData?.groupOptionsModel;
    if (!model) {
      return null;
    }

    const titleText = model.titleText?.trim() ?? '';
    const introText = model.introText?.trim() ?? '';

    if (!titleText && !introText) {
      return null;
    }

    const heading = this.resolveHeading(model.titleHeadingTag);

    return {
      title: titleText,
      introText,
      htmlTag: heading,
      styleClass: model.titleHeadingStyle ?? TitleHeading.H1,
      horizontalAlignment: model.headingHorizAlignment,
      isVisuallyHidden: model.visuallyHiddenTitle ?? false,
    };
  });

  private readonly destroyRef = inject(DestroyRef);
  private readonly elementRef = inject(ElementRef);
  private readonly configService = inject(ConfigService);
  private readonly composer = inject(ComposerService);
  private readonly logger = inject(LoggerService);
  private readonly availableOptionsService = inject(AvailableOptionService);
  private readonly groupOptionsEventService = inject(GroupOptionsEventService);
  private readonly groupOptionsMapper = inject(GroupOptionsMapper);
  private readonly data: DataModule;

  constructor() {
    this.data = this.configService.getDataModuleId(this.elementRef);
  }

  public ngOnInit(): void {
    forkJoin([this.initConfig(), this.getBusinessConfig()]).subscribe(() => {
      this.subscribeComposerNotifier();
      this.initializeOptions();
    });
  }

  /**
   * Initializes the options based on the configuration.
   * If waitForAvailableOptions is enabled, subscribes to available options state.
   * Otherwise, sets the options directly from the configuration.
   */
  private initializeOptions(): void {
    const currentConfig = this.config();

    if (currentConfig?.groupOptionsModel.waitForAvailableOptions) {
      this.availableOptionsService
        .getAvailableOptionsState()
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((state) => {
          if (state.availableOptions.length && currentConfig.groupOptionsModel.optionItemModels) {
            this.filteredOptions.set(
              this.groupOptionsMapper.enrichOptionsWithAvailability(
                currentConfig.groupOptionsModel.optionItemModels,
                state.availableOptions
              )
            );
            this.isVisible.set(true);
          }
          this.isLoaded.set(true);
          this.composer.updateComposerRegisterStatus(this.data.id, ComposerStatusEnum.LOADED);
        });
    } else {
      this.filteredOptions.set(currentConfig?.groupOptionsModel?.optionItemModels ?? []);
      this.isVisible.set(true);
      this.isLoaded.set(true);
      this.composer.updateComposerRegisterStatus(this.data.id, ComposerStatusEnum.LOADED);
    }
  }

  public onOptionClick(option: string): void {
    this.groupOptionsEventService.publishEvent({ optionType: option });
  }

  /**
   * Initializes the configuration of the GroupOptions component.
   * This function is responsible for obtaining the configuration of the business module and making
   * @returns An Observable that is populated once configuration initialization has completed.
   */
  private initConfig(): Observable<GroupOptionsConfig> {
    return this.configService.getBusinessModuleConfig<GroupOptionsConfig>(this.data.config).pipe(
      tap((config) => {
        this.config.set(config);
        this.logger.info('GroupOptionsComponent', 'Business module config', config);
      })
    );
  }

  /**
   * Subscribes to the `notifier$` Observable of the `composer` object.
   * This function filters the events based on the type and componentId,
   * and then updates the status of the event to SUCCESS before notifying the composer.
   * @returns An Observable that completes once the subscription is set up.
   */
  private subscribeComposerNotifier(): void {
    this.composer.notifier$
      .pipe(
        filter(
          (e: ComposerEvent) => e.type === ComposerEventTypeEnum.SubmitRequested && e.componentId === this.data.id
        ),
        takeUntilDestroyed(this.destroyRef)
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
  private getBusinessConfig(): Observable<unknown> {
    return this.configService.getCommonConfig(CommonConfig.BUSINESS_CONFIG).pipe(
      tap((config) => {
        this.logger.info('GroupOptions', 'Business config', config);
      })
    );
  }

  private resolveHeading(titleHeadingTag?: string): TitleHeading {
    return (titleHeadingTag as TitleHeading) ?? TitleHeading.H2;
  }
}
