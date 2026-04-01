import type { OnInit } from '@angular/core';
import { Component, computed, input, signal } from '@angular/core';
import { TabComponent, TabsComponent } from '@dcx/storybook/design-system';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { STORYBOOK_PROVIDERS } from '../../../../stories/providers/storybook.providers';
import type { TabConfig } from '../models/tab.config';
import type { TabsConfig } from '../models/tabs.config';

@Component({
  selector: 'tabs-story-host',
  standalone: true,
  imports: [TabsComponent, TabComponent],
  template: `
    <tabs
      [config]="config()"
      [selectedTabId]="selectedTabId()"
      (selectedTab)="onTabSelected($event)">
      @if (projected()) {
        @for (tab of config().items; track tab.id ?? $index) {
          <tab>
            <div [innerHTML]="tab.content"></div>
          </tab>
        }
      }
    </tabs>
  `,
})
class TabsStoryHostComponent implements OnInit {
  public readonly config = input.required<TabsConfig>();
  public readonly projected = input<boolean>(false);
  public readonly initialSelectedTabId = input<string>('');

  public readonly selectedTabId = signal<string>('');

  public readonly resolvedInitialSelectedTabId = computed(() => {
    const explicitId = this.initialSelectedTabId();
    if (explicitId) {
      return explicitId;
    }

    const firstEnabled = this.config().items.find((item) => !item.isDisabled);
    return firstEnabled?.id ?? '';
  });

  public ngOnInit(): void {
    this.selectedTabId.set(this.resolvedInitialSelectedTabId());
  }

  public onTabSelected(tab: TabConfig): void {
    if (tab.id) {
      this.selectedTabId.set(tab.id);
    }
  }
}

// More on how to set up stories at: https://storybook.js.org/docs/7.0/angular/writing-stories/introduction
const META: Meta<TabsStoryHostComponent> = {
  title: 'Molecules/Tabs',
  component: TabsStoryHostComponent,
  tags: ['autodocs'],
  render: (args) => ({
    props: {
      ...args,
    },
  }),
  parameters: {
    i18nModules: ['Common.Tabs', 'Common.A11y'],
    i18n: {
      mock: {
        'Common.Tabs.Scroll_Left_1': 'Desplazar 1 pestaña a la izquierda',
        'Common.Tabs.Scroll_Left_N': 'Desplazar {{count}} pestañas a la izquierda',
        'Common.Tabs.Scroll_Right_1': 'Desplazar 1 pestaña a la derecha',
        'Common.Tabs.Scroll_Right_N': 'Desplazar {{count}} pestañas a la derecha',

        'Common.Tabs.Scrolled_Left_1': 'Se ha desplazado 1 pestaña a la izquierda.',
        'Common.Tabs.Scrolled_Left_N': 'Se han desplazado {{count}} pestañas a la izquierda.',
        'Common.Tabs.Scrolled_Right_1': 'Se ha desplazado 1 pestaña a la derecha.',
        'Common.Tabs.Scrolled_Right_N': 'Se han desplazado {{count}} pestañas a la derecha.',

        'Common.Tabs.NoMore_Left': 'No hay más pestañas a la izquierda.',
        'Common.Tabs.NoMore_Right': 'No hay más pestañas a la derecha.',
      },
    },
  },
  decorators: [
    moduleMetadata({
      imports: [TabsStoryHostComponent],
      providers: STORYBOOK_PROVIDERS,
    }),
  ],
};

export default META;
type Story = StoryObj<TabsStoryHostComponent>;

export const USING_CONFIG: Story = {
  name: 'Use of Config Param as Data',
  render: () => ({
    props: {
      config: {
        items: [
          {
            id: 'abcd-123-abcd-456',
            tabTrigger: {
              text: 'Vuelos',
              secondaryText: 'Bogotá - Lima',
            },
            content:
              '<h2>Reserva tus vuelos de Bogotá a Lima</h2><p>Encuentra las mejores ofertas de vuelos para tu próximo viaje.</p>',
          },
          {
            id: 'testInititalId',
            tabTrigger: {
              text: 'Hoteles',
            },
            content: '<h2>Hoteles en Lima</h2><p>Explora opciones de alojamiento para todos los presupuestos.</p>',
          },
          {
            id: 'using-disabled',
            tabTrigger: {
              text: 'Disabled Tab',
            },
            isDisabled: true,
            content: '<h2>Alquila un coche en Lima</h2><p>Reserva un vehículo para tu comodidad durante el viaje.</p>',
          },
          {
            id: 'using-paquetes',
            tabTrigger: {
              text: 'Paquetes',
            },
            content:
              '<h2>Descubre paquetes turísticos</h2><p>Viajes organizados para explorar Perú de forma sencilla y económica.</p>',
          },
          {
            id: 'using-actividades',
            tabTrigger: {
              text: 'Actividades',
            },
            content:
              '<h2>Actividades en Lima</h2><p>Reserva tours, excursiones y experiencias únicas en la ciudad.</p>',
          },
          {
            id: 'using-asistencia',
            tabTrigger: {
              text: 'Asistencia de viaje',
            },
            content:
              '<h2>Contrata un seguro de viaje</h2><p>Protege tu viaje con nuestra cobertura completa de asistencia.</p>',
          },
        ] as TabConfig[],
      },
    },
    template: `<tabs-story-host [config]="config"></tabs-story-host>`,
  }),
};

export const PROJECTED_TABS: Story = {
  name: 'Use of Project Content as Data',
  render: () => ({
    props: {
      projected: true,
      config: {
        items: [
          {
            id: 'projected-vuelos',
            tabTrigger: {
              text: 'Vuelos',
              secondaryText: 'Bogotá - Lima',
            },
            content:
              '<h2>Reserva tus vuelos de Bogotá a Lima</h2><p>Encuentra las mejores ofertas de vuelos para tu próximo viaje.</p>',
          },
          {
            id: 'projected-hoteles',
            tabTrigger: {
              text: 'Hoteles',
            },
            content: '<h2>Hoteles en Lima</h2><p>Explora opciones de alojamiento para todos los presupuestos.</p>',
          },
          {
            id: 'projected-disabled',
            tabTrigger: {
              text: 'Disabled Tab',
            },
            isDisabled: true,
            content: '<h2>Alquila un coche en Lima</h2><p>Reserva un vehículo para tu comodidad durante el viaje.</p>',
          },
          {
            id: 'projected-paquetes',
            tabTrigger: {
              text: 'Paquetes',
            },
            content:
              '<h2>Descubre paquetes turísticos</h2><p>Viajes organizados para explorar Perú de forma sencilla y económica.</p>',
          },
          {
            id: 'projected-actividades',
            tabTrigger: {
              text: 'Actividades',
            },
            content:
              '<h2>Actividades en Lima</h2><p>Reserva tours, excursiones y experiencias únicas en la ciudad.</p>',
          },
          {
            id: 'projected-asistencia',
            tabTrigger: {
              text: 'Asistencia de viaje',
            },
            content:
              '<h2>Contrata un seguro de viaje</h2><p>Protege tu viaje con nuestra cobertura completa de asistencia.</p>',
          },
        ] as TabConfig[],
      },
    },
    template: `<tabs-story-host [config]="config" [projected]="projected"></tabs-story-host>`,
  }),
};

export const TABS_AUTOSELECTION_ON_FOCUS_FALSE: Story = {
  name: 'Auto Selection on Focus False',
  render: () => ({
    props: {
      projected: true,
      config: {
        autoSelectOnFocus: false,
        items: [
          {
            id: 'auto-vuelos',
            tabTrigger: {
              text: 'Vuelos',
              secondaryText: 'Bogotá - Lima',
            },
            content:
              '<h2>Reserva tus vuelos de Bogotá a Lima</h2><p>Encuentra las mejores ofertas de vuelos para tu próximo viaje.</p>',
          },
          {
            id: 'auto-hoteles',
            tabTrigger: {
              text: 'Hoteles',
            },
            content: '<h2>Hoteles en Lima</h2><p>Explora opciones de alojamiento para todos los presupuestos.</p>',
          },
          {
            id: 'auto-disabled',
            tabTrigger: {
              text: 'Disabled Tab',
            },
            isDisabled: true,
            content: '<h2>Alquila un coche en Lima</h2><p>Reserva un vehículo para tu comodidad durante el viaje.</p>',
          },
          {
            id: 'auto-paquetes',
            tabTrigger: {
              text: 'Paquetes',
            },
            content:
              '<h2>Descubre paquetes turísticos</h2><p>Viajes organizados para explorar Perú de forma sencilla y económica.</p>',
          },
          {
            id: 'auto-actividades',
            tabTrigger: {
              text: 'Actividades',
            },
            content:
              '<h2>Actividades en Lima</h2><p>Reserva tours, excursiones y experiencias únicas en la ciudad.</p>',
          },
          {
            id: 'auto-asistencia',
            tabTrigger: {
              text: 'Asistencia de viaje',
            },
            content:
              '<h2>Contrata un seguro de viaje</h2><p>Protege tu viaje con nuestra cobertura completa de asistencia.</p>',
          },
        ] as TabConfig[],
      },
    },
    template: `<tabs-story-host [config]="config" [projected]="projected"></tabs-story-host>`,
  }),
};

export const CUSTOM_ITEMS_BY_BREAKPOINT: Story = {
  name: 'Custom Items by Breakpoint',
  render: () => ({
    props: {
      config: {
        autoSelectOnFocus: false,
        breakPointConfig: {
          XS: { visibleItems: 1 },
          S: { visibleItems: 2, itemsToScroll: 2 },
          M: { visibleItems: 2, itemsToScroll: 2 },
          L: { visibleItems: 3 },
          XL: { visibleItems: 4 },
          XXL: { visibleItems: 6 },
        },
        items: [
          {
            id: 'abcd-123-abcd-456',
            tabTrigger: {
              text: 'Vuelos',
              secondaryText: 'Bogotá - Lima',
            },
            content:
              '<h2>Reserva tus vuelos de Bogotá a Lima</h2><p>Encuentra las mejores ofertas de vuelos para tu próximo viaje.</p>',
          },
          {
            id: 'testInititalId',
            tabTrigger: {
              text: 'Hoteles',
            },
            content: '<h2>Hoteles en Lima</h2><p>Explora opciones de alojamiento para todos los presupuestos.</p>',
          },
          {
            id: 'breakpoint-paquetes',
            tabTrigger: {
              text: 'Paquetes',
            },
            content:
              '<h2>Descubre paquetes turísticos</h2><p>Viajes organizados para explorar Perú de forma sencilla y económica.</p>',
          },
          {
            id: 'breakpoint-actividades',
            tabTrigger: {
              text: 'Actividades',
            },
            content:
              '<h2>Actividades en Lima</h2><p>Reserva tours, excursiones y experiencias únicas en la ciudad.</p>',
          },
          {
            id: 'breakpoint-asistencia',
            tabTrigger: {
              text: 'Asistencia de viaje',
            },
            content:
              '<h2>Contrata un seguro de viaje</h2><p>Protege tu viaje con nuestra cobertura completa de asistencia.</p>',
          },
        ] as TabConfig[],
      },
    },
    template: `<tabs-story-host [config]="config"></tabs-story-host>`,
  }),
};

export const SET_INITIAL_ACTIVE_TAB: Story = {
  name: 'Set initial active tab (Hoteles)',
  render: () => ({
    props: {
      initialSelectedTabId: 'testInititalId',
      config: {
        items: [
          {
            id: 'abcd-123-abcd-456',
            tabTrigger: {
              text: 'Vuelos',
              secondaryText: 'Bogotá - Lima',
            },
            content:
              '<h2>Reserva tus vuelos de Bogotá a Lima</h2><p>Encuentra las mejores ofertas de vuelos para tu próximo viaje.</p>',
          },
          {
            id: 'testInititalId',
            tabTrigger: {
              text: 'Hoteles',
            },
            content: '<h2>Hoteles en Lima</h2><p>Explora opciones de alojamiento para todos los presupuestos.</p>',
          },
          {
            id: 'setinitial-disabled',
            tabTrigger: {
              text: 'Disabled Tab',
            },
            isDisabled: true,
            content: '<h2>Alquila un coche en Lima</h2><p>Reserva un vehículo para tu comodidad durante el viaje.</p>',
          },
          {
            id: 'setinitial-paquetes',
            tabTrigger: {
              text: 'Paquetes',
            },
            content:
              '<h2>Descubre paquetes turísticos</h2><p>Viajes organizados para explorar Perú de forma sencilla y económica.</p>',
          },
          {
            id: 'setinitial-actividades',
            tabTrigger: {
              text: 'Actividades',
            },
            content:
              '<h2>Actividades en Lima</h2><p>Reserva tours, excursiones y experiencias únicas en la ciudad.</p>',
          },
          {
            id: 'setinitial-asistencia',
            tabTrigger: {
              text: 'Asistencia de viaje',
            },
            content:
              '<h2>Contrata un seguro de viaje</h2><p>Protege tu viaje con nuestra cobertura completa de asistencia.</p>',
          },
        ] as TabConfig[],
      },
    },
    template: `<tabs-story-host [config]="config" [initialSelectedTabId]="initialSelectedTabId"></tabs-story-host>`,
  }),
};
