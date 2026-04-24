import { Injectable, signal } from '@angular/core';
import { ActionButtonData, PaymentUrlParams } from '@dcx/ui/business-common';

/**
 * Service to manage submit button redirection configuration.
 * This service provides a reactive way for components to modify submit button redirection parameters
 * using Angular signals.
 *
 * Example use case:
 * - WCIOverbookedManager updates redirection parameters based on overbooked status
 * - Other components can modify redirection URLs and types dynamically
 *
 * This pattern allows components to communicate without direct coupling or event bus complexity.
 */
@Injectable({ providedIn: 'root' })
export class SubmitRedirectionService {
  /**
   * Private signal to store custom submit button redirection parameters.
   * Updated by external components to modify page-action-buttons redirection configuration.
   */
  private readonly _submitParams = signal<Partial<ActionButtonData> | null>(null);

  /**
   * Read-only signal exposing submit button redirection parameters.
   * Page-action-buttons component uses this to reactively update its redirection configuration.
   *
   * @example
   * ```typescript
   * export class PageActionButtonsComponent {
   *   private readonly submitRedirection = inject(SubmitRedirectionService);
   *
   *   constructor() {
   *     effect(() => {
   *       const params = this.submitRedirection.submitParams();
   *       if (params) {
   *         this.updateSubmitButton(params);
   *       }
   *     });
   *   }
   * }
   * ```
   */
  public readonly submitParams = this._submitParams.asReadonly();

  /**
   * Sets custom submit button redirection parameters.
   * Called by external components to dynamically modify page-action-buttons redirection configuration.
   *
   * @param params - Partial ActionButtonData with redirection properties to override
   */
  public setSubmitParams(params: Partial<ActionButtonData>): void {
    this._submitParams.set(params);
  }

  /**
   * Clears submit button redirection parameters, resetting to default state.
   * Useful when custom redirection configuration is no longer applicable.
   */
  public clearSubmitParams(): void {
    this._submitParams.set(null);
  }

  /**
   * Creates a payment URL by replacing placeholders with actual booking data.
   * @param url - The URL template with placeholders
   * @param params - The parameters to replace in the URL
   * @returns The URL with all placeholders replaced
   */
  public createPaymentUrl(url: string, params: PaymentUrlParams): string {
    const replacements = this.buildUrlReplacements(params);
    return this.replaceUrlPlaceholders(url, replacements);
  }

  /**
   * Builds the replacement map for URL placeholders.
   * @returns A record of placeholders and their corresponding values
   */
  private buildUrlReplacements(params: PaymentUrlParams): Record<string, string> {
    return {
      '{culture}': params.culture ?? '',
      '{PNR}': params.pnr ?? '',
      '{TabId}': params.tabSessionId ?? '',
      '{PosCode}': params.posCode ?? '',
      '{Prefix}': params.prefix ?? params.posCode ?? '',
      '{currency}': params.currency ?? '',
      '{flow}': params.flow ?? '',
      '{sessionRef}': params.sessionRef ?? '',
      '{source}': params.source ?? '',
    };
  }
  /**
   * Replaces all placeholders in the URL with their corresponding values.
   * @param url - The URL template with placeholders
   * @param replacements - A record of placeholders and their replacement values
   * @returns The URL with all placeholders replaced
   */
  private replaceUrlPlaceholders(url: string, replacements: Record<string, string>): string {
    return Object.entries(replacements).reduce(
      (processedUrl, [placeholder, value]) => processedUrl.replaceAll(placeholder, value),
      url
    );
  }
}
