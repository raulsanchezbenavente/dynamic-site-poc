import type { IconConfig } from '@dcx/ui/libs';
import { COMMON_TRANSLATIONS } from '@dcx/ui/mock-repository';

import type { BreadcrumbConfig } from '../../models/breadcrumb.config';

export const DATA_INITIAL_VALUE: BreadcrumbConfig = {
  home: {
    title: 'Home',
    url: '/',
    icon: { name: 'home' } as IconConfig,
  },
  items: [
    {
      title: 'Ofertas y destinos',
      url: '/ofertas',
    },
    {
      title: 'Ofertas de vuelos hoy',
    },
  ],
} as unknown as BreadcrumbConfig;
