import { FormControl } from '@angular/forms';
import { MinusPlusComponent } from '@dcx/storybook/design-system';
import type { MinusPlusVM } from '@dcx/ui/libs';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { expect, within } from '@storybook/test';

import { STORYBOOK_PROVIDERS } from '../../../../stories/providers/storybook.providers';

// ---------------------------------------------------------------------------
// Variant helpers
// ---------------------------------------------------------------------------

interface MinusPlusVariant {
  label: string;
  meta: ReadonlyArray<{ label: string; value: string }>;
  config: MinusPlusVM;
}

const GRID_TEMPLATE = `
  <div class="dcx-story-grid">
    @for (variant of variants; track variant.label) {
      <div class="dcx-story-card">
        <h4 class="dcx-story-heading">{{ variant.label }}</h4>
        <div class="dcx-story-meta">
          @for (metaItem of variant.meta; track metaItem.label) {
            <div class="dcx-story-meta__item">
              <span class="dcx-story-meta__label">{{ metaItem.label }}</span>
              <span>{{ metaItem.value }}</span>
            </div>
          }
        </div>
        <minus-plus [minusPlusVM]="variant.config"></minus-plus>
      </div>
    }
  </div>
`;

// ---------------------------------------------------------------------------
// STATES variants
// ---------------------------------------------------------------------------

const STATE_VARIANTS: ReadonlyArray<MinusPlusVariant> = [
  {
    label: 'Default',
    meta: [
      { label: 'Value', value: '5' },
      { label: 'Range', value: '1 – 9' },
    ],
    config: {
      formValidationConfig: {
        formControlName: 'stateDefault',
        formControl: new FormControl(5),
        minValue: 1,
        maxValue: 9,
        isReadOnly: true,
      },
      labelledBy: 'state-default-label',
      statusLabel: 'Adults',
      minusLabel: 'Decrease adults',
      plusLabel: 'Increase adults',
    },
  },
  {
    label: 'At minimum',
    meta: [
      { label: 'Value', value: '0' },
      { label: 'Range', value: '0 – 5' },
    ],
    config: {
      formValidationConfig: {
        formControlName: 'stateMin',
        formControl: new FormControl(0),
        minValue: 0,
        maxValue: 5,
        isReadOnly: true,
      },
      labelledBy: 'state-min-label',
      statusLabel: 'Infants',
      minusLabel: 'Decrease infants',
      plusLabel: 'Increase infants',
    },
  },
  {
    label: 'At maximum',
    meta: [
      { label: 'Value', value: '9' },
      { label: 'Range', value: '1 – 9' },
    ],
    config: {
      formValidationConfig: {
        formControlName: 'stateMax',
        formControl: new FormControl(9),
        minValue: 1,
        maxValue: 9,
        isReadOnly: true,
      },
      labelledBy: 'state-max-label',
      statusLabel: 'Adults',
      minusLabel: 'Decrease adults',
      plusLabel: 'Increase adults',
    },
  },
  {
    label: 'Single value',
    meta: [
      { label: 'Value', value: '1' },
      { label: 'Range', value: '1 – 1' },
    ],
    config: {
      formValidationConfig: {
        formControlName: 'stateSingle',
        formControl: new FormControl(1),
        minValue: 1,
        maxValue: 1,
        isReadOnly: true,
      },
      labelledBy: 'state-single-label',
      statusLabel: 'Adults',
      minusLabel: 'Decrease adults',
      plusLabel: 'Increase adults',
    },
  },
];

const RANGE_VARIANTS: ReadonlyArray<MinusPlusVariant> = [
  {
    label: 'Small range',
    meta: [
      { label: 'Value', value: '1' },
      { label: 'Range', value: '0 – 3' },
    ],
    config: {
      formValidationConfig: {
        formControlName: 'rangeSmall',
        formControl: new FormControl(1),
        minValue: 0,
        maxValue: 3,
        isReadOnly: true,
      },
      labelledBy: 'range-small-label',
      statusLabel: 'Infants',
      minusLabel: 'Decrease infants',
      plusLabel: 'Increase infants',
    },
  },
  {
    label: 'Standard range',
    meta: [
      { label: 'Value', value: '2' },
      { label: 'Range', value: '1 – 9' },
    ],
    config: {
      formValidationConfig: {
        formControlName: 'rangeStandard',
        formControl: new FormControl(2),
        minValue: 1,
        maxValue: 9,
        isReadOnly: true,
      },
      labelledBy: 'range-standard-label',
      statusLabel: 'Adults',
      minusLabel: 'Decrease adults',
      plusLabel: 'Increase adults',
    },
  },
  {
    label: 'Large range',
    meta: [
      { label: 'Value', value: '10' },
      { label: 'Range', value: '0 – 99' },
    ],
    config: {
      formValidationConfig: {
        formControlName: 'rangeLarge',
        formControl: new FormControl(10),
        minValue: 0,
        maxValue: 99,
        isReadOnly: true,
      },
      labelledBy: 'range-large-label',
      statusLabel: 'Quantity',
      minusLabel: 'Decrease quantity',
      plusLabel: 'Increase quantity',
    },
  },
];

// ---------------------------------------------------------------------------
// META
// ---------------------------------------------------------------------------

const META: Meta<MinusPlusComponent> = {
  title: 'Molecules/Selection Controls/Minus Plus',
  component: MinusPlusComponent,
  decorators: [
    moduleMetadata({
      imports: [MinusPlusComponent],
      providers: STORYBOOK_PROVIDERS,
    }),
  ],
};

export default META;
type Story = StoryObj<MinusPlusComponent>;

// ---------------------------------------------------------------------------
// Dimension stories
// ---------------------------------------------------------------------------

export const STATES: Story = {
  name: 'States',
  render: () => ({
    template: GRID_TEMPLATE,
    props: { variants: STATE_VARIANTS },
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Verify all 4 state cards rendered
    const cards = canvasElement.querySelectorAll('.dcx-story-card');
    await expect(cards).toHaveLength(STATE_VARIANTS.length);

    // Verify 4 minus-plus instances
    const components = canvasElement.querySelectorAll('minus-plus');
    await expect(components).toHaveLength(4);

    // Verify headings
    await expect(canvas.getByText('Default')).toBeInTheDocument();
    await expect(canvas.getByText('At minimum')).toBeInTheDocument();
    await expect(canvas.getByText('At maximum')).toBeInTheDocument();
    await expect(canvas.getByText('Single value')).toBeInTheDocument();

    // Verify button states — each component has 2 buttons
    const buttons = canvasElement.querySelectorAll('button');
    await expect(buttons).toHaveLength(8);

    // Default state (index 0): both buttons enabled
    await expect(buttons[0]).not.toHaveAttribute('disabled');
    await expect(buttons[1]).not.toHaveAttribute('disabled');

    // At minimum (index 2,3): minus disabled, plus enabled
    await expect(buttons[2]).toHaveAttribute('disabled');
    await expect(buttons[3]).not.toHaveAttribute('disabled');

    // At maximum (index 4,5): minus enabled, plus disabled
    await expect(buttons[4]).not.toHaveAttribute('disabled');
    await expect(buttons[5]).toHaveAttribute('disabled');

    // Single value (index 6,7): both disabled
    await expect(buttons[6]).toHaveAttribute('disabled');
    await expect(buttons[7]).toHaveAttribute('disabled');
  },
};

export const RANGES: Story = {
  name: 'Ranges',
  render: () => ({
    template: GRID_TEMPLATE,
    props: { variants: RANGE_VARIANTS },
  }),
};
