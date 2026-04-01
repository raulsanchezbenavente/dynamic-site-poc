import { SkeletonComponent } from '@dcx/storybook/design-system';
import { EnumAnimationSkeleton, EnumAppearenceSkeleton } from '@dcx/ui/libs';
import type { SkeletonConfig } from '@dcx/ui/libs';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { expect, within } from '@storybook/test';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';

import { STORYBOOK_PROVIDERS } from '../../../../stories/providers/storybook.providers';

interface SkeletonVariant {
  label: string;
  description?: string;
  meta: ReadonlyArray<{ label: string; value: string }>;
  config: SkeletonConfig;
}

const STORYBOOK_SKELETON_CSS_VARS_STYLES =
  '--skeleton-gap:16px; --skeleton-line-height: 80px; --skeleton-circle-size: 80px';

const GRID_TEMPLATE = `
  <div class="dcx-story-grid">
    @for (variant of variants; track variant.label) {
      <div class="dcx-story-card">
        <h4 class="dcx-story-heading">{{ variant.label }}</h4>
        @if (variant.description) {
          <p class="dcx-story-description">{{ variant.description }}</p>
        }
        <div class="dcx-story-meta">
          @for (metaItem of variant.meta; track metaItem.label) {
            <div class="dcx-story-meta__item">
              <span class="dcx-story-meta__label">{{ metaItem.label }}</span>
              <span>{{ metaItem.value }}</span>
            </div>
          }
        </div>
        <ds-skeleton style="${STORYBOOK_SKELETON_CSS_VARS_STYLES};" [config]="variant.config"></ds-skeleton>
      </div>
    }
  </div>
`;

const APPEARANCE_VARIANTS: ReadonlyArray<SkeletonVariant> = [
  {
    label: 'Circle',
    description: 'Round shape for avatar or badge placeholders.',
    meta: [
      { label: 'Appearance', value: 'Circle' },
      { label: 'Animation', value: 'Progress' },
      { label: 'Count', value: '2' },
    ],
    config: {
      appearance: EnumAppearenceSkeleton.CIRCLE,
      animation: EnumAnimationSkeleton.PROGRESS,
      count: 2,
    },
  },
  {
    label: 'Line',
    description: 'Default block to mirror paragraphs or cards.',
    meta: [
      { label: 'Appearance', value: 'Line' },
      { label: 'Animation', value: 'Progress' },
      { label: 'Count', value: '3' },
    ],
    config: {
      appearance: EnumAppearenceSkeleton.LINE,
      animation: EnumAnimationSkeleton.PROGRESS,
      count: 3,
    },
  },
];

const ANIMATION_VARIANTS: ReadonlyArray<SkeletonVariant> = [
  {
    label: 'Progress (Light Surface)',
    meta: [
      { label: 'Animation', value: 'Progress' },
      { label: 'Surface', value: 'Light' },
    ],
    config: {
      animation: EnumAnimationSkeleton.PROGRESS,
      appearance: EnumAppearenceSkeleton.LINE,
    },
  },
  {
    label: 'Progress (Dark Surface)',
    meta: [
      { label: 'Animation', value: 'Progress Dark' },
      { label: 'Surface', value: 'Dark' },
    ],
    config: {
      animation: EnumAnimationSkeleton.PROGRESS_DARK,
      appearance: EnumAppearenceSkeleton.LINE,
    },
  },
  {
    label: 'Pulse',
    meta: [
      { label: 'Animation', value: 'Pulse' },
      { label: 'Surface', value: 'Neutral' },
    ],
    config: {
      animation: EnumAnimationSkeleton.PULSE,
      appearance: EnumAppearenceSkeleton.LINE,
    },
  },
  {
    label: 'Static',
    meta: [
      { label: 'Animation', value: 'None' },
      { label: 'Surface', value: 'Any' },
    ],
    config: {
      animation: EnumAnimationSkeleton.FALSE,
      appearance: EnumAppearenceSkeleton.LINE,
    },
  },
];

const PLAYGROUND_ARGS = {
  animation: EnumAnimationSkeleton.PROGRESS,
  appearance: EnumAppearenceSkeleton.LINE,
  count: 2,
} satisfies Record<string, unknown>;

const PLAYGROUND_ARGTYPES = {
  animation: {
    control: { type: 'select' as const },
    options: Object.values(EnumAnimationSkeleton),
    name: 'Animation mode',
    description: 'Defines the motion applied while data loads.',
    table: {
      category: 'Behavior',
      type: { summary: 'EnumAnimationSkeleton' },
      defaultValue: { summary: EnumAnimationSkeleton.PROGRESS },
    },
  },
  appearance: {
    control: { type: 'select' as const },
    options: Object.values(EnumAppearenceSkeleton),
    name: 'Appearance',
    description: 'Visual shape used to mirror the eventual content.',
    table: {
      category: 'Appearance',
      type: { summary: 'EnumAppearenceSkeleton' },
      defaultValue: { summary: EnumAppearenceSkeleton.LINE },
    },
  },
  count: {
    control: { type: 'number' as const, min: 1, max: 6, step: 1 },
    name: 'Count',
    description: 'Number of placeholders created in the stack.',
    table: {
      category: 'Layout',
      type: { summary: 'number' },
      defaultValue: { summary: 2 },
    },
  },
  config: { table: { disable: true } },
} satisfies Record<string, unknown>;

const META: Meta<SkeletonComponent> = {
  title: 'Atoms/Skeleton',
  component: SkeletonComponent,
  decorators: [
    moduleMetadata({
      imports: [NgxSkeletonLoaderModule, SkeletonComponent],
      providers: STORYBOOK_PROVIDERS,
    }),
  ],
};

export default META;
type Story = StoryObj<SkeletonComponent>;

export const PLAYGROUND: Story = {
  name: 'Playground',
  args: PLAYGROUND_ARGS,
  argTypes: PLAYGROUND_ARGTYPES,
  parameters: {
    layout: 'centered',
  },
  render: (args) => {
    const playgroundArgs = args as unknown as typeof PLAYGROUND_ARGS;
    return {
      props: {
        config: {
          animation: playgroundArgs.animation,
          appearance: playgroundArgs.appearance,
          count: playgroundArgs.count,
        },
      },
      template: `
        <ds-skeleton
          style="--skeleton-gap: ${STORYBOOK_SKELETON_CSS_VARS_STYLES};"
          [config]="config" />
      `,
    };
  },
};

export const APPEARANCES: Story = {
  name: 'Appearances',
  render: () => ({
    template: GRID_TEMPLATE,
    props: {
      variants: APPEARANCE_VARIANTS,
    },
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Circle')).toBeInTheDocument();
    await expect(canvas.getByText('Line')).toBeInTheDocument();
    const cards = canvasElement.querySelectorAll('.dcx-story-card');
    await expect(cards).toHaveLength(APPEARANCE_VARIANTS.length);
  },
};

export const ANIMATIONS: Story = {
  name: 'Animation modes',
  render: () => ({
    template: GRID_TEMPLATE,
    props: {
      variants: ANIMATION_VARIANTS,
    },
  }),
  play: async ({ canvasElement }) => {
    const cards = canvasElement.querySelectorAll('.dcx-story-card');
    await expect(cards).toHaveLength(ANIMATION_VARIANTS.length);
    const loaders = canvasElement.querySelectorAll('ngx-skeleton-loader');
    await expect(loaders).toHaveLength(ANIMATION_VARIANTS.length);
  },
};
