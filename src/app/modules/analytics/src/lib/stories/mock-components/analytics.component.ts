/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/naming-convention */
import type { AfterViewInit, ElementRef, OnDestroy } from '@angular/core';
import { Component, inject, ViewChild, ViewEncapsulation } from '@angular/core';
import { PageViewStrategyService } from '@dcx/module/analytics';
import { Subject } from 'rxjs';

import type { AnalyticsEvent } from '../../interfaces/events/analytics-event.interfaces';
import { AnalyticsService } from '../../services/analytics.service';
import { AnalyticsGaGtmColivingRewriteService } from '../../workdarounds/GA-GTM-coliving/analytics-ga-gtm-coliving-rewrite.service';

import { ANALYTICS_CONFIG } from './configs/config.json';

declare const JSONEditor: any;
interface PageViewAnalyticsEventMock extends AnalyticsEvent {
  eventName: 'page_view';
  data: {
    country_pos: string;
    language: string;
    language_nav: string;
    time_zone: string;
    user_hour: string;
    user_type: 'Guest';
    user_id: string;
    ga_session_id: number;
    page_location: string;
    page_referrer: string;
    page_title: string;
    page_name?: string;
    payment_provider?: string;
    screen_resolution: string;
  };
}
@Component({
  selector: 'story-analytics',
  templateUrl: './analytics.component.html',
  styleUrl: './analytics.component.scss',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
})
export class AnalyticsStoryComponent implements AfterViewInit, OnDestroy {
  @ViewChild('editorContainer', { static: true }) public editorContainer!: ElementRef;
  @ViewChild('checkboxGaGtmColiving', { static: false }) public checkboxGaGtmColiving!: ElementRef;
  @ViewChild('checkboxPageview', { static: false }) public checkboxPageview!: ElementRef;
  private readonly analyticsService = inject(AnalyticsService);
  private readonly analyticsGaGtmColivingRewriteService = inject(AnalyticsGaGtmColivingRewriteService);
  private readonly analyticsPageViewStrategyService = inject(PageViewStrategyService);
  private readonly unsubscribe$ = new Subject<void>();
  private readonly DATA_TIMEOUT_FALLBACK = 10000;
  private dataSent: boolean = false;

  constructor() {
    this.analyticsService.setConfig(ANALYTICS_CONFIG);
  }

  public ngAfterViewInit(): void {
    const container = this.editorContainer.nativeElement;
    const options = {
      mode: 'tree',
      modes: ['tree', 'code'],
      onChange: () => {
        this.analyticsService.setConfig(editor.get());
      },
      onModeChange: () => {
        editor.expandAll();
      },
    };
    const editor = new JSONEditor(container, options);
    editor.set(ANALYTICS_CONFIG);
    editor.expandAll();

    this.initializeCheckboxStates();
  }

  private initializeCheckboxStates(): void {
    const gaGtmColivingInitialStatus = sessionStorage.getItem('enableGaGtmColivingRewrite');
    this.checkboxGaGtmColiving.nativeElement.checked =
      gaGtmColivingInitialStatus === null ? true : gaGtmColivingInitialStatus === 'true';
    const pageViewInitialStatus = sessionStorage.getItem('enablePageViewEvent');
    this.checkboxPageview.nativeElement.checked =
      pageViewInitialStatus === null ? true : pageViewInitialStatus === 'true';
    this.changeGAGTMColivingStatus();
    this.changePageviewStatus();
  }

  public changeGAGTMColivingStatus(): void {
    if (this.checkboxGaGtmColiving) {
      const checked = this.checkboxGaGtmColiving.nativeElement.checked;
      sessionStorage.setItem('enableGaGtmColivingRewrite', checked ? 'true' : 'false');
      this.analyticsGaGtmColivingRewriteService.initGaGtmColiving(checked);
    }
  }

  public changePageviewStatus(): void {
    if (this.checkboxPageview) {
      const checked = this.checkboxPageview.nativeElement.checked;
      sessionStorage.setItem('enablePageViewEvent', checked ? 'true' : 'false');
      const sendPageViewRef: ReturnType<typeof setTimeout> = setTimeout(() => {
        this.sendTestPageView(sendPageViewRef);
      }, this.DATA_TIMEOUT_FALLBACK);
      this.analyticsPageViewStrategyService.enablePageView(checked);
    }
  }

  public sendPageViewEvent(data: PageViewAnalyticsEventMock['data']): void {
    this.analyticsService.trackEvent({ eventName: 'page_view', data });
  }

  public sendTestPageView(sendPageViewRef?: ReturnType<typeof setTimeout>): void {
    if (sendPageViewRef) {
      clearTimeout(sendPageViewRef);
    }
    if (this.dataSent) {
      return;
    }
    this.dataSent = true;
    const mockPageViewData = {
      country_pos: 'CO',
      language: 'es-ES',
      language_nav: 'en',
      time_zone: 'GMT+01:00',
      user_hour: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      user_type: 'Guest',
      user_id: 'NA',
      ga_session_id: Date.now(),
      page_location: globalThis.location.href,
      page_referrer: document.referrer,
      page_title: document.title,
      screen_resolution: `${globalThis.screen.width}x${globalThis.screen.height}`,
    };
    this.analyticsService.trackEvent({ eventName: 'page_view', data: mockPageViewData });
  }

  public trackPurchase(): void {
    this.trackEvent({
      eventName: 'purchase',
      data: {
        currency: 'EUR',
        value: 566,
        flow: 'MANAGE_BOOKING_FLOW',
        // items: []
      },
    });
  }
  public ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  public trackViewItem(): void {
    this.trackEvent({
      eventName: 'view_item',
      data: {
        item_list_id: 'NA',
        item_list_name: 'Flight',
        coupon: 'Not Set',
        value: 0,
        currency: 'euro',
        items: [],
      },
    });
  }

  public trackSelectItem(): void {
    this.trackEvent({
      eventName: 'select_item',
      data: {
        item_list_id: 'NA',
        item_list_name: 'Ancillary',
        coupon: 'NA',
        currency: 'KES',
        items: [],
      },
    });
  }

  public trackAddToCartItem(): void {
    this.trackEvent({
      eventName: 'add_to_cart',
      data: {
        currency: 'USD',
        flow: 'BOOKING_FLOW',
        value: 120,
        paxADTLength: 3,
        paxCHDLength: 4,
        paxINFLength: 2,
        tripType: 'RT',
        items: [],
      },
    });
  }

  public trackIbeAsync(): void {
    this.trackEvent({
      eventName: 'ibe_async',
      data: {
        element_id: 'button-container',
        action: 'click',
        business_process: 'my business-process',
      },
    });
  }

  public trackIbeError(): void {
    this.trackEvent({
      eventName: 'ibe_error',
      data: {
        error_type: 'Bad Request',
        error_code: '666',
        error_url: 'https://hola.com/test',
      },
    });
  }

  public dispatchButtonEvents(eventName: string): void {
    switch (eventName) {
      case 'trackPurchase':
        this.trackPurchase();
        break;
      case 'trackViewItem':
        this.trackViewItem();
        break;
      case 'trackSelectItem':
        this.trackSelectItem();
        break;
      case 'trackAddToCartItem':
        this.trackAddToCartItem();
        break;
      case 'trackIbeAsync':
        this.trackIbeAsync();
        break;
      case 'trackIbeError':
        this.trackIbeError();
        break;
      case 'sendTestPageView':
        this.sendTestPageView();
        break;
      default:
        console.warn(`Error on sent event: ${eventName}`);
    }
  }

  private trackEvent(event: AnalyticsEvent): void {
    this.analyticsService.trackEvent(event);
  }
}
