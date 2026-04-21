import { DsSummaryBuilderComponent } from '@dcx/storybook/design-system';
import { CommonTranslationKeys } from '@dcx/ui/libs';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { STORYBOOK_PROVIDERS } from '../../../../../stories/providers/storybook.providers';
import type { SummaryDataRenderer } from '../../summary-renderer/models/summary-data-renderer.model';

const META: Meta<DsSummaryBuilderComponent> = {
  title: 'Molecules/Summary/Summary Builder',
  component: DsSummaryBuilderComponent,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [DsSummaryBuilderComponent],
      providers: STORYBOOK_PROVIDERS,
    }),
  ],
};

export default META;
type Story = StoryObj<DsSummaryBuilderComponent>;

export const SINGLE_FIELD: Story = {
  name: 'Single Field',
  args: {
    config: {
      item1: { label: 'Clave', value: 'Valor' },
    } as Record<string, SummaryDataRenderer>,
  },
};

export const MULTIPLE_FIELDS: Story = {
  name: 'Multiple Fields',
  args: {
    config: {
      first: { label: 'Nombre', value: 'Ana' },
      last: { label: 'Apellidos', value: 'García' },
      age: { label: 'Edad', value: '28' },
    } as Record<string, SummaryDataRenderer>,
  },
};

export const EMPTYFIELDS: Story = {
  name: 'Empty Fields',
  args: {
    config: {
      first: { label: 'Nombre', value: '' },
      last: { label: 'Apellidos', value: '' },
      age: { label: 'Edad', value: '' },
    } as Record<string, SummaryDataRenderer>,
  },
};

export const WITH_GRID: Story = {
  name: 'With Grid',
  args: {
    config: {
      firstName: { label: 'Nombre', value: 'Ana' },
      lastName: { label: 'Apellidos', value: 'García' },
      address: { label: 'Dirección', value: 'Cr 13 #6-45' },
      DateOfBirth: { label: 'Fecha de Nacimiento', value: '01, Jun, 1995' },
    },
    gridConfig: {
      columns: 2,
    },
  },
};

export const WITH_GRID_TWO_COLUMNS_ON_MOBILE: Story = {
  name: 'With Mobile Two Columns Grid',
  args: {
    config: {
      firstName: { label: 'Nombre', value: 'Ana' },
      lastName: { label: 'Apellidos', value: 'García' },
      email: { label: 'Email', value: 'ana.garcia@example.com' },
      phone: { label: 'Teléfono', value: '+57 300 1234567' },
    },
    gridConfig: {
      columns: 2,
      twoColumnsOnMobile: true,
    },
  },
};
