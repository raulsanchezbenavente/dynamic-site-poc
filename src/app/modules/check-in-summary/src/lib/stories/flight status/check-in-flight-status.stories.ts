import type { Provider } from '@angular/core';
import { SegmentsStatusService } from '@dcx/ui/api-layer';
import { type Meta, moduleMetadata, type StoryObj } from '@storybook/angular';
import { of } from 'rxjs';

import { CheckInSummaryComponent } from '../../check-in-summary.component';
import { SEGMENT_STATUS_SCENARIOS } from '../mocks/segments-status.mock';
import { STORYBOOK_PROVIDERS } from '../providers/storybook.provider';

const META: Meta<CheckInSummaryComponent> = {
  title: 'Main/Check In Summary/Flight  Status',
  component: CheckInSummaryComponent,
  tags: ['autodocs'],
  render: (args) => ({
    props: {
      backgroundColor: null,
      ...args,
    },
  }),
  argTypes: {},
  decorators: [
    moduleMetadata({
      imports: [],
      declarations: [],
      providers: STORYBOOK_PROVIDERS,
    }),
  ],
};

function createSegmentsStatusProvider(scenario: keyof typeof SEGMENT_STATUS_SCENARIOS): Provider {
  return {
    provide: SegmentsStatusService,
    useValue: {
      getSegmentsStatus: () =>
        of({
          result: {
            data: {
              segments: SEGMENT_STATUS_SCENARIOS[scenario],
            },
          },
          success: true,
        }),
    },
  };
}

function createCustomProvidersForSegmentsStatus(scenario: keyof typeof SEGMENT_STATUS_SCENARIOS): Provider[] {
  const BASE_PROVIDERS = STORYBOOK_PROVIDERS.filter(
    (provider) => typeof provider === 'object' && 'provide' in provider && provider.provide !== SegmentsStatusService
  );
  return [...BASE_PROVIDERS, createSegmentsStatusProvider(scenario)];
}

export default META;
type Story = StoryObj<CheckInSummaryComponent>;

export const DEFAULT: Story = {
  name: 'Default',
  args: {},
  decorators: [
    moduleMetadata({
      providers: createCustomProvidersForSegmentsStatus('default'),
    }),
  ],
};

export const LANDED: Story = {
  name: 'Landed',
  args: {},
  decorators: [
    moduleMetadata({
      providers: createCustomProvidersForSegmentsStatus('landed'),
    }),
  ],
};

export const CANCELLED: Story = {
  name: 'Cancelled',
  args: {},
  decorators: [
    moduleMetadata({
      providers: createCustomProvidersForSegmentsStatus('cancelled'),
    }),
  ],
};

export const ON_ROUTE: Story = {
  name: 'On Route',
  args: {},
  decorators: [
    moduleMetadata({
      providers: createCustomProvidersForSegmentsStatus('onRoute'),
    }),
  ],
};

export const DIVERTED: Story = {
  name: 'Diverted',
  args: {},
  decorators: [
    moduleMetadata({
      providers: createCustomProvidersForSegmentsStatus('diverted'),
    }),
  ],
};

export const DELAYED: Story = {
  name: 'Delayed',
  args: {},
  decorators: [
    moduleMetadata({
      providers: createCustomProvidersForSegmentsStatus('delayed'),
    }),
  ],
};

export const RETURNED: Story = {
  name: 'Returned',
  args: {},
  decorators: [
    moduleMetadata({
      providers: createCustomProvidersForSegmentsStatus('returned'),
    }),
  ],
};
