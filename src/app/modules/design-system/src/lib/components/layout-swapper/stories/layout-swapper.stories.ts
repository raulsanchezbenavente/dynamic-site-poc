import { DsLayoutSwapperComponent, LayoutSlotDirective } from '@dcx/storybook/design-system';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { STORYBOOK_PROVIDERS } from '../../../../stories/providers/storybook.providers';

// More on how to set up stories at: https://storybook.js.org/docs/7.0/angular/writing-stories/introduction
const META: Meta<DsLayoutSwapperComponent> = {
  title: 'Molecules/Layout Swapper',
  component: DsLayoutSwapperComponent,
  tags: ['autodocs'],
  render: (args) => ({
    props: {
      ...args,
    },
  }),
  decorators: [
    moduleMetadata({
      imports: [DsLayoutSwapperComponent, LayoutSlotDirective],
      providers: STORYBOOK_PROVIDERS,
    }),
  ],
};

export default META;
type Story = StoryObj<DsLayoutSwapperComponent>;

export const DEFAULT: Story = {
  name: 'Default',
  render: (): any => ({
    component: DsLayoutSwapperComponent,
    template: `
        <button (click)="layoutswap.showProjection('SECTION_1')">Ver Sección 1</button>
        <br/>
        <button (click)="layoutswap.showProjection('SECTION_2')">Ver Sección 2</button>
        <br/>
        <button (click)="layoutswap.showProjection('SECTION_3')">Ver Sección 3</button>
        <br/>
        <ds-layout-swapper #layoutswap>
          <ng-template layoutSlot="SECTION_1">
            <div>Contenido de la sección 1</div>
          </ng-template>

          <ng-template layoutSlot="SECTION_2">
            <div>Contenido de la sección 2</div>
          </ng-template>

          <ng-template layoutSlot="SECTION_3">
            <div>Contenido de la sección 3</div>
          </ng-template>
        </ds-layout-swapper>
      `,
  }),
};
