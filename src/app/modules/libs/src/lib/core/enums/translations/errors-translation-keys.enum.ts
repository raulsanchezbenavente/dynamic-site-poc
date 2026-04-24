/**
 * Translation keys for error messages loaded from CMS dictionary nodes.
 *
 * Keys are resolved from two sources depending on availability:
 * - **Legacy `Errors` node**: keys have no prefix (e.g. `'194'`, `'CheckinNotOpenException'`).
 * - **UI Plus `UI_PLUS_Errors` node**: keys carry the `Error.` prefix (e.g. `'Errors.39886'`).
 *
 * When the same concept exists in both nodes, **legacy takes precedence** and its key naming is used.
 *
 * This dual-source approach is transitional and will remain until all error keys are unified
 * under a single CMS node in a future consolidation.
 */
export enum ErrorsTranslationKeys {
  Error_194 = '194',
  Error_36894 = '36894',
  Error_CheckinAlreadyClosedException = 'CheckinAlreadyClosedException',
  Error_CheckinNotOpenException = 'CheckinNotOpenException',
  Error_NotAllowedServiceException = 'NotAllowedServiceException',
  Error_Navigation_BackNotAllowed_Title = 'Errors.Navigation.BackNotAllowed_Title',
  Error_Navigation_BackNotAllowed_Message = 'Errors.Navigation.BackNotAllowed_Message',
  Errors_Wait_Title = 'Errors.Wait_Title',
  Errors_Sorry_Title = 'Errors.Sorry_Title',
  Errors_Generic_Internal = 'Errors.Generic.Internal',
}
