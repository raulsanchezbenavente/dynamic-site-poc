import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, input, OnInit } from '@angular/core';
import { DateDisplayComponent, DateDisplayConfig, IconComponent, TagComponent, TagConfig } from '@dcx/ui/design-system';
import { CultureServiceEx, JourneyType , CommonTranslationKeys } from '@dcx/ui/libs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import dayjs from 'dayjs';

import { CarrierMapperService } from '../../../../services/carrier-mapper/carrier-mapper.service';
import { buildFareTagConfig } from '../../../../utils/build-fare-tag-config';
import { CarriersDisplayMode, TransportOperatedBy } from '../../../schedules';
import { TransportOperatedByComponent } from '../../../schedules/components/atoms/transport-operated-by/transport-operated-by.component';

import { SummaryCartItineraryConfig } from './models/summary-car-itinerary.config';
import { SummaryCartScheduleComponent } from './summary-cart-schedule/summary-cart-schedule.component';
import { TranslationKeys } from '../../enums/translation-keys.enum';

@Component({
  selector: 'summary-cart-itinerary',
  templateUrl: './summary-cart-itinerary.component.html',
  styleUrls: ['./styles/summary-cart-itinerary.styles.scss'],
  host: {
    class: 'summary-cart-itinerary',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TranslateModule,
    TransportOperatedByComponent,
    SummaryCartScheduleComponent,
    IconComponent,
    DateDisplayComponent,
    TagComponent,
  ],
  standalone: true,
})
export class SummaryCartItineraryComponent implements OnInit {
  public readonly config = input.required<SummaryCartItineraryConfig>();
  private readonly cultureServiceEx = inject(CultureServiceEx);
  private readonly carrierMapper = inject(CarrierMapperService);

  public translatedLabel = '';
  public isOutbound: boolean = true;

  public scheduleConfig = {
    carriersDisplayMode: CarriersDisplayMode.OPERATED_BY,
  };

  protected readonly translate = inject(TranslateService);
  protected readonly translationKeys = TranslationKeys;
  protected readonly commonTranslationKeys = CommonTranslationKeys;
  private readonly cdr = inject(ChangeDetectorRef);
  public operatingCarriers: TransportOperatedBy[] = [];

  protected shortDateFormat = 'EEE d MMM y';
  public fareTagConfig!: TagConfig;

  get dateConfig(): DateDisplayConfig {
    const raw = this.isOutbound ? this.config().journey.schedule.std : this.config().journey.schedule.sta;
    return {
      date: this.toDisplayDate(raw),
      format: this.shortDateFormat,
    };
  }

  public ngOnInit(): void {
    if (this.config().journey) {
      this.isOutbound = this.config().journey.journeyType === JourneyType.OUTBOUND;
    }
    this.setTranslatedLabel();
    this.setDateFormat();
    this.setOperatingCarriers();
    const fareConfig = this.config().fareTagConfig;

    if (fareConfig) {
      this.fareTagConfig = buildFareTagConfig(fareConfig.text, this.translate, fareConfig.cssClass);
    }
  }

  /** Idempotent setter for translatedLabel using translate.instant */
  protected setTranslatedLabel(): void {
    const journeyType = this.config().journey?.journeyType;
    switch (journeyType) {
      case JourneyType.OUTBOUND:
        this.translatedLabel = this.translate.instant(TranslationKeys.Schedule_DepartureLabel);
        break;
      case JourneyType.INBOUND:
      case JourneyType.RETURN:
        this.translatedLabel = this.translate.instant(TranslationKeys.Schedule_ReturnLabel);
        break;
      default:
        this.translatedLabel = '';
    }
    this.cdr.markForCheck();
  }

  /** Idempotent setter for date format using cultureServiceEx */
  protected setDateFormat(): void {
    const longFmt = this.cultureServiceEx.getUserCulture?.()?.longDateFormat;
    this.shortDateFormat = longFmt ?? 'EEE d MMM y';
    this.cdr.markForCheck();
  }

  private setOperatingCarriers(): void {
    const segments = this.config().journey?.segments ?? [];
    this.operatingCarriers = this.carrierMapper.getUniqueOperatingCarriers(segments).map((name) => ({
      name,
    }));
  }

  /** Normalize to local noon to avoid timezone/DST visual shifts. */
  private toDisplayDate(value: string | Date): Date {
    const d = dayjs(value);
    return new Date(d.year(), d.month(), d.date(), 12);
  }
}
