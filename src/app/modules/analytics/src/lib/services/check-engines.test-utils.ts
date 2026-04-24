import { AnalyticsEngine } from '../enums/analytics-engines.enum';
import { AnalyticsConfig, AnalyticsEngineConfig } from '../interfaces/analytics-config.interface';

// --- helpers ---
const byLocale = (a: string, b: string): number =>
  a.localeCompare(b, undefined, {
    sensitivity: 'base', // sensitivity: 'base', ignores case and accents (change to 'variant' if you need to distinguish them)
    numeric: true, // “natural” order: '2' < '10'
  });

const norm = (s: string): string => s.trim();
const normArr = (a?: string[] | null): string[] | undefined =>
  a?.length ? Array.from(new Set(a.map(norm))).sort(byLocale) : undefined;

const sameSet = (a?: string[] | null, b?: string[] | null): boolean => {
  const A = normArr(a),
    B = normArr(b);
  if (!A && !B) return true;
  if (A?.length !== B?.length) return false;
  return A!.every((v, i) => v === B![i]);
};

// Resolves effective engines for an event (same logic as the service)
function resolveEnginesForEvent(config: AnalyticsConfig, eventName: string): AnalyticsEngineConfig[] {
  const defaults = [...(config.analyticsEngines ?? [])];
  const ex = config.analyticsExceptions?.find(
    (e) => String(e.eventName).toLowerCase() === String(eventName).toLowerCase()
  );
  if (!ex) return defaults;

  if (ex.includeDefaultEngines) {
    const m = new Map<AnalyticsEngine, AnalyticsEngineConfig>(defaults.map((d) => [d.engine, d]));
    for (const item of ex.analyticsEngines) if (!m.has(item.engine)) m.set(item.engine, item);
    return Array.from(m.values());
  }
  return ex.analyticsEngines.map(({ engine, accounts }) => ({ engine, accounts }));
}

/**
 * Returns true if (eventName, accounts) is valid according to CONFIG.
 * - Empty/undefined accounts → there must be at least one effective engine WITHOUT accounts.
 * - Non-empty accounts       → there must be at least one effective engine with EXACTLY those accounts.
 */
export function isDispatchValid(config: AnalyticsConfig, eventName: string, accounts?: string[]): boolean {
  const effective = resolveEnginesForEvent(config, eventName);
  const acc = normArr(accounts); // undefined if empty

  if (!acc) {
    // look for engines without configured accounts
    return effective.some((e) => !e.accounts || e.accounts.length === 0);
  }
  // look for an engine whose accounts exactly match
  return effective.some((e) => sameSet(e.accounts ?? null, acc));
}
