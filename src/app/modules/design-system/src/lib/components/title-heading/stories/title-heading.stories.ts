import { DsTitleHeadingComponent } from '@dcx/storybook/design-system';
import { HorizontalAlign } from '@dcx/ui/libs';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { expect, within } from '@storybook/test';

import { TitleHeading } from '../enums/title-heading.enum';
import type { TitleHeadingConfig } from '../models/title-heading.model';

// --- Variant type ---

interface TitleHeadingVariant {
  config: TitleHeadingConfig;
}

// --- Shared template ---

const GRID_TEMPLATE = `
  <div class="dcx-story-grid dcx-story-grid--rows">
    @for (variant of variants; track $index) {
      <div class="dcx-story-card" style="--dcx-story-card-align-items: center; border: 0; padding-bottom: 24px; width: 100%;">
        <ds-title-heading [config]="variant.config" />
      </div>
    }
  </div>
`;

// --- Heading level variants ---

const HEADING_VARIANTS: ReadonlyArray<TitleHeadingVariant> = [
  {
    config: {
      title: 'Heading H1',
      htmlTag: TitleHeading.H1,
      styleClass: TitleHeading.H1,
      introText:
        'Embark on a seamless journey with Flyr Airlines, where we redefine air travel with a commitment to safety, comfort, and unparalleled service.',
    },
  },
  {
    config: {
      title: 'Heading H2',
      htmlTag: TitleHeading.H2,
      styleClass: TitleHeading.H2,
      introText:
        'Embark on a seamless journey with Flyr Airlines, where we redefine air travel with a commitment to safety, comfort, and unparalleled service.',
    },
  },
  {
    config: {
      title: 'Heading H3',
      htmlTag: TitleHeading.H3,
      styleClass: TitleHeading.H3,
      introText:
        "Explore a world of possibilities with LoremAir's extensive network of destinations. From iconic landmarks to hidden gems, every flight is an opportunity.",
    },
  },
  {
    config: {
      title: 'Heading H4',
      htmlTag: TitleHeading.H4,
      styleClass: TitleHeading.H4,
      introText:
        'LoremAir boasts a fleet of state-of-the-art aircraft, equipped with the latest technology for efficiency and safety.',
    },
  },
];

// --- Style override variants ---

const STYLE_OVERRIDE_VARIANTS: ReadonlyArray<TitleHeadingVariant> = [
  {
    config: {
      title: 'Heading H2 With H1 Styles',
      htmlTag: TitleHeading.H2,
      styleClass: TitleHeading.H1,
      introText:
        'This demonstrates semantic HTML vs. visual styling separation. <br>The htmlTag (h2) ensures proper accessibility and document outline, while styleClass (h1) controls the visual appearance.',
    },
  },
  {
    config: {
      title: 'Heading H3 With H1 Styles',
      htmlTag: TitleHeading.H3,
      styleClass: TitleHeading.H1,
      introText: 'An H3 in the document outline but visually matching an H1 for design consistency.',
    },
  },
  {
    config: {
      title: 'Heading H1 With H3 Styles',
      htmlTag: TitleHeading.H1,
      styleClass: TitleHeading.H3,
      introText: 'Semantic H1 for document structure, but visually smaller using H3 styles.',
    },
  },
];

// --- Alignment variants ---

const ALIGNMENT_VARIANTS: ReadonlyArray<TitleHeadingVariant> = [
  {
    config: {
      title: 'Left Aligned Heading',
      htmlTag: TitleHeading.H2,
      styleClass: TitleHeading.H2,
      horizontalAlignment: HorizontalAlign.LEFT,
      introText: 'This heading and intro text are aligned to the left.',
    },
  },
  {
    config: {
      title: 'Center Aligned Heading',
      htmlTag: TitleHeading.H2,
      styleClass: TitleHeading.H2,
      horizontalAlignment: HorizontalAlign.CENTER,
      introText: 'This heading and intro text are centered (default behavior).',
    },
  },
  {
    config: {
      title: 'Right Aligned Heading',
      htmlTag: TitleHeading.H2,
      styleClass: TitleHeading.H2,
      horizontalAlignment: HorizontalAlign.RIGHT,
      introText: 'This heading and intro text are aligned to the right.',
    },
  },
];

// --- Visually hidden variants ---

const VISUALLY_HIDDEN_VARIANTS: ReadonlyArray<TitleHeadingVariant> = [
  {
    config: {
      title: 'This heading is visually hidden',
      htmlTag: TitleHeading.H2,
      styleClass: TitleHeading.H2,
      isVisuallyHidden: true,
      introText: 'The intro text is still visible. Inspect the DOM to verify the heading element exists.',
    },
  },
  {
    config: {
      title: 'This heading is visible',
      htmlTag: TitleHeading.H2,
      styleClass: TitleHeading.H2,
      isVisuallyHidden: false,
      introText: 'Both the heading and intro text are visible.',
    },
  },
];

// --- Meta ---

type Story = StoryObj<DsTitleHeadingComponent>;

const META: Meta<DsTitleHeadingComponent> = {
  title: 'Atoms/Title Heading',
  component: DsTitleHeadingComponent,
  decorators: [
    moduleMetadata({
      imports: [DsTitleHeadingComponent],
    }),
  ],
};

export default META;

// --- Stories ---

export const HEADINGS: Story = {
  name: 'Heading Levels',
  render: () => ({
    template: GRID_TEMPLATE,
    props: {
      variants: HEADING_VARIANTS,
    },
  }),
  play: async ({ canvasElement }): Promise<void> => {
    const canvas = within(canvasElement);

    const h1Elements = canvasElement.querySelectorAll('h1');
    const h2Elements = canvasElement.querySelectorAll('h2');
    const h3Elements = canvasElement.querySelectorAll('h3');
    const h4Elements = canvasElement.querySelectorAll('h4');

    await expect(h1Elements.length).toBe(1);
    await expect(h2Elements.length).toBe(1);
    await expect(h3Elements.length).toBe(1);
    await expect(h4Elements.length).toBe(1);

    const introTexts = canvasElement.querySelectorAll('.title-heading_intro-text');
    await expect(introTexts.length).toBe(4);

    const cards = canvas.getAllByRole('heading');
    await expect(cards.length).toBeGreaterThanOrEqual(4);
  },
};

export const STYLE_OVERRIDE: Story = {
  name: 'Style Override',
  render: () => ({
    template: GRID_TEMPLATE,
    props: {
      variants: STYLE_OVERRIDE_VARIANTS,
    },
  }),
  play: async ({ canvasElement }): Promise<void> => {
    // H2 tag with H1 style
    const h2Elements = canvasElement.querySelectorAll('ds-title-heading h2');
    await expect(h2Elements.length).toBe(1);

    const h2WithH1Style = h2Elements[0];
    await expect(h2WithH1Style.classList.contains('context-h1')).toBe(true);

    // H3 tag with H1 style
    const h3Elements = canvasElement.querySelectorAll('ds-title-heading h3');
    await expect(h3Elements.length).toBe(1);
    await expect(h3Elements[0].classList.contains('context-h1')).toBe(true);

    // H1 tag with H3 style
    const h1Elements = canvasElement.querySelectorAll('ds-title-heading h1');
    await expect(h1Elements.length).toBe(1);
    await expect(h1Elements[0].classList.contains('context-h3')).toBe(true);
  },
};

export const ALIGNMENTS: Story = {
  name: 'Alignments',
  render: () => ({
    template: GRID_TEMPLATE,
    props: {
      variants: ALIGNMENT_VARIANTS,
    },
  }),
  play: async ({ canvasElement }): Promise<void> => {
    const hostElements = canvasElement.querySelectorAll('ds-title-heading');
    await expect(hostElements.length).toBe(3);

    await expect(hostElements[0].classList.contains('title-heading--align-left')).toBe(true);
    await expect(hostElements[1].classList.contains('title-heading--align-center')).toBe(true);
    await expect(hostElements[2].classList.contains('title-heading--align-right')).toBe(true);
  },
};

export const VISUALLY_HIDDEN: Story = {
  name: 'Visually Hidden',
  render: () => ({
    template: GRID_TEMPLATE,
    props: {
      variants: VISUALLY_HIDDEN_VARIANTS,
    },
  }),
  play: async ({ canvasElement }): Promise<void> => {
    const headings = canvasElement.querySelectorAll('ds-title-heading h2');
    await expect(headings.length).toBe(2);

    // First heading should be visually hidden
    await expect(headings[0].classList.contains('hide-visually')).toBe(true);

    // Second heading should be visible
    await expect(headings[1].classList.contains('hide-visually')).toBe(false);
  },
};
