import { CommonModule } from '@angular/common';
import { DateDisplayComponent } from '@dcx/storybook/design-system';
import { type Meta, moduleMetadata, type StoryObj } from '@storybook/angular';
import { expect, within } from '@storybook/test';
import dayjs from 'dayjs';

import { STORYBOOK_PROVIDERS } from '../../../../stories/providers/storybook.providers';
import type { DateDisplayConfig } from '../models/date-display.config';

interface DateVariant {
  label: string;
  testId: string;
  config: DateDisplayConfig;
}

const STACK_STYLES =
  ['display:flex', 'gap: 16px', 'flex-wrap: wrap', 'align-items:flex-start', 'width:100%'].join('; ') + ';';
const CARD_STYLES =
  [
    'min-width:220px',
    'padding:16px',
    'border:1px solid rgba(19, 33, 68, 0.12)',
    'border-radius:12px',
    'display:flex',
    'flex-direction:column',
    'gap:8px',
  ].join('; ') + ';';
const LABEL_STYLES =
  [
    'font-size:12px',
    'text-transform:uppercase',
    'letter-spacing:0.08em',
    'color:rgba(19, 33, 68, 0.65)',
    'font-weight:600',
  ].join('; ') + ';';

const BASE_DATE = dayjs('2015-10-02T09:15:00.000Z');
const LONG_FORMAT = 'dddd, MMMM D, YYYY';
const SHORT_FORMAT = 'EEE d MMM. y';
const CULTURE_OPTIONS = ['auto', 'en', 'es', 'fr', 'pt'];
const PLAYGROUND_DEFAULTS = {
  dateIso: '2015-10-02T09:15:00.000Z',
  format: LONG_FORMAT,
  culture: 'auto',
} as const;

const LOCALE_VARIANTS: ReadonlyArray<DateVariant> = [
  { label: 'Spanish', testId: 'locale-es', config: { date: BASE_DATE, format: LONG_FORMAT, culture: 'es' } },
  { label: 'English', testId: 'locale-en', config: { date: BASE_DATE, format: LONG_FORMAT } },
  { label: 'French', testId: 'locale-fr', config: { date: BASE_DATE, format: LONG_FORMAT, culture: 'fr' } },
];

const FORMAT_VARIANTS: ReadonlyArray<DateVariant> = [
  { label: 'Hero (Long form)', testId: 'format-long', config: { date: BASE_DATE, format: LONG_FORMAT } },
  {
    label: 'List (Compact)',
    testId: 'format-compact',
    config: { date: BASE_DATE, format: SHORT_FORMAT, culture: 'en' },
  },
  { label: 'Badge (Numeric)', testId: 'format-numeric', config: { date: BASE_DATE, format: 'MM/dd/YYYY' } },
];

const META: Meta<DateDisplayComponent> = {
  title: 'Atoms/Date Display',
  component: DateDisplayComponent,
  parameters: {
    docs: {
      description: {
        component:
          'Renders localized dates using CLDR-like patterns that are converted to dayjs tokens. Provide `config.date`, optionally override `config.format` or `config.culture` to preview alternative locales.',
      },
    },
  },
  decorators: [
    moduleMetadata({
      imports: [CommonModule, DateDisplayComponent],
      providers: [...STORYBOOK_PROVIDERS],
    }),
  ],
};

export default META;
type Story = StoryObj<DateDisplayComponent>;

export const PLAYGROUND: Story = {
  name: 'Playground',
  parameters: { layout: 'centered' },
  args: PLAYGROUND_DEFAULTS as Record<string, unknown>,
  argTypes: {
    dateIso: {
      control: 'text',
      name: 'Date (ISO string)',
      description: 'Any value parseable by dayjs (ISO recommended).',
      table: {
        category: 'Content',
        type: { summary: 'string' },
        defaultValue: { summary: PLAYGROUND_DEFAULTS.dateIso },
      },
    },
    format: {
      control: 'text',
      name: 'Format pattern',
      description: 'CLDR-style tokens mapped to dayjs.',
      table: {
        category: 'Appearance',
        type: { summary: 'string' },
        defaultValue: { summary: PLAYGROUND_DEFAULTS.format },
      },
    },
    culture: {
      control: 'select',
      options: CULTURE_OPTIONS,
      name: 'Culture override',
      description: 'Choose locale or use auto to rely on CultureServiceEx.',
      table: {
        category: 'Locale',
        type: { summary: CULTURE_OPTIONS.join(' | ') },
        defaultValue: { summary: PLAYGROUND_DEFAULTS.culture },
      },
    },
    config: { table: { disable: true } },
    ngOnInit: { table: { disable: true } },
    defaultFormat: { table: { disable: true } },
    formatToUse: { table: { disable: true } },
    parseDate: { table: { disable: true } },
    internalInit: { table: { disable: true } },
    mapFormatToDayjs: { table: { disable: true } },
    cultureServiceEx: { table: { disable: true } },
  } as Record<string, unknown>,
  render: (args) => {
    const resolved = args as unknown as typeof PLAYGROUND_DEFAULTS;
    const dateValue = dayjs(resolved.dateIso);
    const normalizedDate = dateValue.isValid() ? dateValue : BASE_DATE;

    return {
      props: {
        config: {
          date: normalizedDate,
          format: resolved.format ?? undefined,
          culture: resolved.culture === 'auto' ? undefined : resolved.culture,
        },
      },
      template: '<date-display [config]="config" />',
    };
  },
};

export const LOCALES: Story = {
  name: 'Locales',
  render: () => ({
    props: {
      localeVariants: LOCALE_VARIANTS,
      stackStyles: STACK_STYLES,
      cardStyles: CARD_STYLES,
      labelStyles: LABEL_STYLES,
    },
    template: `
      <div style="{{ stackStyles }}">
        @for (variant of localeVariants; track variant.testId) {
          <div role="group" aria-label="{{ variant.label }}" data-testid="{{ variant.testId }}" style="{{ cardStyles }}">
            <span style="{{ labelStyles }}">{{ variant.label }}</span>
            <date-display [config]="variant.config" />
          </div>
        }
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const cards = canvas.getAllByRole('group');

    await expect(cards).toHaveLength(3);
    await expect(canvas.getByTestId('locale-es')).toHaveTextContent(/Viernes|Vier\./i);
    await expect(canvas.getByTestId('locale-en')).toHaveTextContent(/Friday/i);
    await expect(canvas.getByTestId('locale-fr')).toHaveTextContent(/Vendredi/i);
  },
};

export const FORMATS: Story = {
  name: 'Formats',
  render: () => ({
    props: {
      formatVariants: FORMAT_VARIANTS,
      stackStyles: STACK_STYLES,
      cardStyles: CARD_STYLES,
      labelStyles: LABEL_STYLES,
    },
    template: `
      <div style="{{ stackStyles }}">
        @for (variant of formatVariants; track variant.testId) {
          <div role="group" aria-label="{{ variant.label }}" data-testid="{{ variant.testId }}" style="{{ cardStyles }}">
            <span style="{{ labelStyles }}">{{ variant.label }}</span>
            <date-display [config]="variant.config" />
          </div>
        }
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const cards = canvas.getAllByRole('group');

    await expect(cards).toHaveLength(3);
    await expect(canvas.getByTestId('format-long')).toHaveTextContent('Friday, October 2, 2015');
    await expect(canvas.getByTestId('format-compact')).toHaveTextContent('Fri. 2 Oct. 2015');
    await expect(canvas.getByTestId('format-numeric')).toHaveTextContent('10/02/2015');
  },
};
