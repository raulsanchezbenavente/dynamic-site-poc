import { Type } from '@angular/core';

export type BlockComponentLoader = () => Promise<Type<unknown>>;

export const componentMap: Record<string, BlockComponentLoader> = {
  // CORE
  multiTabBlock_uiplus: () => import('@dynamic-composite').then((m) => m.DsTabsComponent),
  rteBlock_uiplus: () =>
    import('./modules/dynamic-composite/core-blocks/rte-injector/rte-injector.component').then(
      (m) => m.RteInjectorComponent
    ),

  //Avianca
  authorizationBlock_uiplus: () =>
    import('./modules/authorization/src/lib/authorization.component').then((m) => m.AuthorizationComponent),
  CorporateMainHeaderBlock_uiplus: () =>
    import('./modules/main-header/src/lib/main-header.component').then((m) => m.CorporateMainHeaderComponent),
  CorporateMainFooterBlock_uiplus: () =>
    import('./modules/footer-main/src/lib/footer-main.component').then((m) => m.CorporateFooterMainComponent),
  BreadcrumbBlock_uiplus: () =>
    import('./modules/breadcrumb/src/lib/breadcrumb.component').then((m) => m.BreadcrumbComponent),
  loyaltyOverviewCardBlock_uiplus: () =>
    import('./modules/loyalty-overview-card/src/lib/loyalty-overview-card.component').then(
      (m) => m.LoyaltyOverviewCardComponent
    ),
  accountProfileBlock_uiplus: () =>
    import('./modules/account-profile/src/lib/account-profile.component').then((m) => m.AccountProfileComponent),
  findBookingsBlock_uiplus: () =>
    import('./modules/find-bookings/src/lib/find-bookings.component').then((m) => m.FindBookingsComponent),
};

export const configInputAliases: Record<string, string> = {
  authorizationBlock_uiplus: 'baseConfig',
  CorporateMainHeaderBlock_uiplus: 'baseConfig',
  CorporateMainFooterBlock_uiplus: 'baseConfig',
  BreadcrumbBlock_uiplus: 'baseConfig',
  loyaltyOverviewCardBlock_uiplus: 'baseConfig',
  accountProfileBlock_uiplus: 'baseConfig',
  findBookingsBlock_uiplus: 'baseConfig',
};

const resolvedComponentCache = new Map<string, Type<unknown>>();
const pendingComponentCache = new Map<string, Promise<Type<unknown> | null>>();

export const loadBlockComponent = (key: string): Promise<Type<unknown> | null> => {
  const cached = resolvedComponentCache.get(key);
  if (cached) return Promise.resolve(cached);

  const pending = pendingComponentCache.get(key);
  if (pending) return pending;

  const loader = componentMap[key];
  if (!loader) return Promise.resolve(null);

  const loadPromise = loader()
    .then((component) => {
      resolvedComponentCache.set(key, component);
      return component;
    })
    .catch(() => null)
    .finally(() => {
      pendingComponentCache.delete(key);
    });

  pendingComponentCache.set(key, loadPromise);
  return loadPromise;
};

export const blockComponentRegistry = {
  componentMap,
  loadBlockComponent,
  getConfigInputName: (key: string): string | undefined => configInputAliases[key],
} as const;

const collectComponentKeys = (value: unknown, result: Set<string>): void => {
  if (Array.isArray(value)) {
    for (const item of value) {
      collectComponentKeys(item, result);
    }
    return;
  }

  if (!value || typeof value !== 'object') {
    return;
  }

  const record = value as Record<string, unknown>;
  const component = record['component'];
  if (component && typeof component === 'object') {
    const componentId = (component as Record<string, unknown>)['id'];
    if (typeof componentId === 'string' || typeof componentId === 'number') {
      const normalizedId = String(componentId).trim();
      if (normalizedId) {
        result.add(normalizedId);
      }
    }
  }

  collectComponentKeys(record['rows'], result);
  collectComponentKeys(record['cols'], result);
  collectComponentKeys(record['tabs'], result);
  collectComponentKeys(record['components'], result);
};

export const preloadLayoutComponents = async (layout: unknown): Promise<void> => {
  const keys = new Set<string>();
  collectComponentKeys(layout, keys);
  await Promise.allSettled(Array.from(keys, (key) => loadBlockComponent(key)));
};
