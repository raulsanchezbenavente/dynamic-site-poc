import type { FareBenefitsList } from '@dcx/ui/libs';
import { FareItemApplicability } from '@dcx/ui/libs';

export const AVAILABLE_FARES_BASIC_FAKE: FareBenefitsList = {
  ariaAttributes: {
    ariaLabel: 'listado tarifa basic',
  },
  items: [
    {
      icon: {
        name: 'backpack',
      },
      content: '1 artículo personal (bolso)',
      applicability: FareItemApplicability.INCLUDED,
    },
    {
      icon: {
        name: 'currency',
      },
      content: 'Equipaje de mano (10 kg)',
      applicability: FareItemApplicability.CHARGEABLE,
    },
    {
      icon: {
        name: 'currency',
      },
      content: 'Equipaje de bodega (23 kg)',
      applicability: FareItemApplicability.CHARGEABLE,
    },
    {
      icon: {
        name: 'currency',
      },
      content: 'Check-in en aeropuerto',
      applicability: FareItemApplicability.CHARGEABLE,
    },
    {
      icon: {
        name: 'currency',
      },
      content: 'Selección de asientos',
      applicability: FareItemApplicability.CHARGEABLE,
    },
    {
      icon: {
        name: 'currency',
      },
      content: 'Menú a bordo',
      applicability: FareItemApplicability.CHARGEABLE,
    },
    {
      icon: {
        name: 'currency',
      },
      content: 'Cambios (antes del vuelo)',
      applicability: FareItemApplicability.CHARGEABLE,
    },
    {
      icon: {
        name: 'cross',
      },
      content: 'Acumula lifemiles',
      applicability: FareItemApplicability.NOT_INCLUDED,
    },
    {
      icon: {
        name: 'cross',
      },
      content: 'Reembolso',
      applicability: FareItemApplicability.NOT_INCLUDED,
    },
  ],
};

export const AVAILABLE_FARES_CLASSIC_FAKE: FareBenefitsList = {
  ariaAttributes: {
    ariaLabel: 'listado tarifa classic',
  },
  items: [
    {
      icon: {
        name: 'backpack',
      },
      content: '1 artículo personal (bolso)',
      applicability: FareItemApplicability.INCLUDED,
    },
    {
      icon: {
        name: 'baggage-carry-on',
      },
      content: '1 equipaje de mano (10 kg)',
      applicability: FareItemApplicability.INCLUDED,
    },
    {
      icon: {
        name: 'baggage',
      },
      content: '1 equipaje de bodega (23 kg)',
      applicability: FareItemApplicability.INCLUDED,
    },
    {
      icon: {
        name: 'boarding-pass',
      },
      content: 'Check-in en aeropuerto',
      applicability: FareItemApplicability.INCLUDED,
    },
    {
      icon: {
        name: 'seat-airplane',
      },
      content: 'Asiento Economy incluido',
      applicability: FareItemApplicability.INCLUDED,
    },
    {
      icon: {
        name: 'life-miles',
      },
      content: 'Acumula 5 lifemiles por cada USD',
      applicability: FareItemApplicability.INCLUDED,
    },
    {
      icon: {
        name: 'currency',
      },
      content: 'Menú a bordo',
      applicability: FareItemApplicability.CHARGEABLE,
    },
    {
      icon: {
        name: 'currency',
      },
      content: 'Cambios (antes del vuelo)',
      applicability: FareItemApplicability.CHARGEABLE,
    },
    {
      icon: {
        name: 'cross',
      },
      content: 'Reembolso',
      applicability: FareItemApplicability.NOT_INCLUDED,
    },
  ],
};

export const AVAILABLE_FARES_FLEX_FAKE: FareBenefitsList = {
  ariaAttributes: {
    ariaLabel: 'listado tarifa flex',
  },
  items: [
    {
      icon: { name: 'backpack' },
      content: '1 artículo personal (bolso)',
      applicability: FareItemApplicability.INCLUDED,
    },
    {
      icon: { name: 'baggage-carry-on' },
      content: '1 equipaje de mano (10 kg)',
      applicability: FareItemApplicability.INCLUDED,
    },
    {
      icon: { name: 'baggage' },
      content: '1 equipaje de bodega (23 kg)',
      applicability: FareItemApplicability.INCLUDED,
    },
    {
      icon: { name: 'boarding-pass' },
      content: 'Check-in en aeropuerto',
      applicability: FareItemApplicability.INCLUDED,
    },
    {
      icon: { name: 'seat-airplane' },
      content: 'Asiento Plus (sujeto a disponibilidad)',
      applicability: FareItemApplicability.INCLUDED,
    },
    {
      icon: { name: 'life-miles' },
      content: 'Acumula 7 lifemiles por cada USD',
      applicability: FareItemApplicability.INCLUDED,
    },
    {
      icon: { name: 'airplane-change' },
      content: 'Cambios (antes del vuelo)',
      applicability: FareItemApplicability.INCLUDED,
    },
    {
      icon: { name: 'refunds' },
      content: 'Reembolso (antes del vuelo)',
      applicability: FareItemApplicability.INCLUDED,
    },
    {
      icon: { name: 'currency' },
      content: 'Menú a bordo',
      applicability: FareItemApplicability.CHARGEABLE,
    },
  ],
};
