import { CheckInCommonTranslationKeys } from '../enums';

const BLOCKED_REASON_TRANSLATION_PREFIX = CheckInCommonTranslationKeys.CheckIn_BoardingPass_Blocked_NodeKey;

export const mapBlockedReasonTranslation = (
  reason: string,
  fallbackMessage: string,
  translateByKey: (key: string) => string
): string => {
  const key = `${BLOCKED_REASON_TRANSLATION_PREFIX}${reason}`;
  const translated = translateByKey(key);

  if (translated !== key) {
    return translated;
  }

  const normalizedReason = reason ? `${reason.charAt(0).toUpperCase()}${reason.slice(1)}` : reason;
  const normalizedKey = `${BLOCKED_REASON_TRANSLATION_PREFIX}${normalizedReason}`;
  const normalizedTranslated = translateByKey(normalizedKey);

  return normalizedTranslated === normalizedKey ? fallbackMessage : normalizedTranslated;
};
