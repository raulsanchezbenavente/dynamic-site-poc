import { HttpClient } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';

const batchComponentKeys = new Map<string, Set<string>>();
const batchLogTimers = new Map<string, ReturnType<typeof setTimeout>>();
const fetchedTranslationRequests = new Set<string>();
const translationsReadyMarkerKey = '__dynamicPageTranslationsReadyMarker';

const BLOCK_KEY_TO_COMPONENT_NAME: Record<string, string> = {
  CorporateMainHeaderBlock_uiplus: 'CorporateMainHeader',
  CorporateMainHeaderBlock_uiplus_EX: 'CorporateMainHeader',
  BreadcrumbBlock_uiplus: 'Breadcrumb',
  CorporateMainFooterBlock_uiplus: 'CorporateFooterMain',
  CorporateMainFooterBlock_uiplus_EX: 'CorporateFooterMain',
  loyaltyOverviewCardBlock_uiplus: 'LoyaltyOverviewCard',
  loyaltyOverviewCard_uiplus_EX: 'LoyaltyOverviewCard',
  accountProfileBlock_uiplus: 'AccountProfile',
  accountProfile_uiplus_EX: 'AccountProfile',
  multiTabBlock_uiplus: 'MultiTab',
  authorizationBlock_uiplus: 'Authorization',
  checkInSummaryBlock_uiplus: 'CheckInSummary',
};

type QueueTranslationsParams = {
  batchId: string;
  componentKey: string;
  moduleTranslationMap: Record<string, string[]>;
  document: Document;
  http: HttpClient;
  translateService: TranslateService;
  culture?: string;
};

export function queueTranslationsByRenderedComponent(params: QueueTranslationsParams): void {
  const { batchId, componentKey, moduleTranslationMap, document, http, translateService, culture = 'en-US' } = params;

  if (!batchId || !componentKey) {
    return;
  }

  const resolvedComponentName = BLOCK_KEY_TO_COMPONENT_NAME[componentKey] ?? componentKey;
  const translationKeys = moduleTranslationMap[resolvedComponentName] ?? [];
  const valuesToAdd = translationKeys.length > 0 ? translationKeys : [resolvedComponentName];

  const keys = batchComponentKeys.get(batchId) ?? new Set<string>();
  for (const value of valuesToAdd) {
    const normalized = String(value ?? '').trim();
    if (normalized) {
      keys.add(normalized);
    }
  }
  batchComponentKeys.set(batchId, keys);

  const previousTimer = batchLogTimers.get(batchId);
  if (previousTimer) {
    clearTimeout(previousTimer);
  }

  const timer = setTimeout(() => {
    const finalKeys = batchComponentKeys.get(batchId);
    if (!finalKeys || finalKeys.size === 0) {
      return;
    }

    const csv = Array.from(finalKeys).join(',');
    const encodedCsv = encodeURIComponent(csv);
    const requestSignature = `${culture}::${csv}`;
    console.log('[block-outlet] final component keys (encoded):', encodedCsv);

    if (fetchedTranslationRequests.has(requestSignature)) {
      // Translations are already available locally; notify readiness for this current batch.
      const marker = Date.now();
      (document as Document & { [key: string]: unknown })[translationsReadyMarkerKey] = marker;
      document.dispatchEvent(
        new CustomEvent('dynamic-page:translations-ready', {
          detail: { batchId, marker },
        })
      );
      return;
    }

    const url =
      `https://av-booking-local.newshore.es/configuration/api/v1/UI_PLUS/Translation/GetByCultureAndKeys` +
      `?culture=${culture}&keys=${encodedCsv}`;

    http.get<Record<string, string>>(url).subscribe({
      next: (translations) => {
        translateService.setTranslation(culture, translations, true);
        translateService.setFallbackLang(culture);
        translateService.use(culture);
        fetchedTranslationRequests.add(requestSignature);

        const marker = Date.now();
        (document as Document & { [key: string]: unknown })[translationsReadyMarkerKey] = marker;
        document.dispatchEvent(
          new CustomEvent('dynamic-page:translations-ready', {
            detail: { batchId, marker },
          })
        );
      },
      error: (error) => {
        console.warn('[block-outlet] translation request failed', { url, error });
      },
    });
  }, 200);

  batchLogTimers.set(batchId, timer);
}
