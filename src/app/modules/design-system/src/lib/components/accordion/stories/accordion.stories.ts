import { type Meta, moduleMetadata, type StoryObj } from '@storybook/angular';
import { expect, within } from '@storybook/test';

import { AccordionComponent } from '../accordion.component';
import { AccordionItemComponent } from '../components/accordion-item/accordion-item.component';
import type { AccordionConfig } from '../models/accordion.config';

// ─── Meta ─────────────────────────────────────────────────────────────────

const META: Meta<AccordionComponent> = {
  title: 'Molecules/Accordion',
  component: AccordionComponent,
  decorators: [
    moduleMetadata({
      imports: [AccordionItemComponent],
    }),
  ],
  parameters: {
    layout: 'padded',
  },
};

export default META;

type Story = StoryObj<AccordionComponent>;

// ─── BEHAVIORS ────────────────────────────────────────────────────────────

export const BEHAVIORS: Story = {
  name: 'Behaviors',
  render: () => ({
    template: `
      <div class="dcx-story-grid" style="--dcx-story-card-width: 480px; --dcx-story-card-maxwidth: 48%;">

        <div class="dcx-story-card">
          <h4 class="dcx-story-heading">Single expand</h4>
          <p class="dcx-story-description">Only one item can be open at a time. Opening a new item collapses the active one.</p>
          <ds-accordion>
            <ds-accordion-item title="First section" [isInitiallyExpanded]="true">
              <p>This section is initially open. Opening another will collapse this one.</p>
            </ds-accordion-item>
            <ds-accordion-item title="Second section">
              <p>Click to expand — the first section will close automatically.</p>
            </ds-accordion-item>
            <ds-accordion-item title="Third section">
              <p>Only one section remains open at a time.</p>
            </ds-accordion-item>
          </ds-accordion>
        </div>

        <div class="dcx-story-card">
          <h4 class="dcx-story-heading">Multiple expand</h4>
          <p class="dcx-story-description">Multiple items can be open simultaneously when allowMultipleExpanded is enabled.</p>
          <ds-accordion [config]="{ allowMultipleExpanded: true }">
            <ds-accordion-item title="First section" [isInitiallyExpanded]="true">
              <p>This section is open. Opening others will not close this one.</p>
            </ds-accordion-item>
            <ds-accordion-item title="Second section" [isInitiallyExpanded]="true">
              <p>This section is also open. Multiple panels can coexist.</p>
            </ds-accordion-item>
            <ds-accordion-item title="Third section">
              <p>Click to open — the others remain expanded.</p>
            </ds-accordion-item>
          </ds-accordion>
        </div>

      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const triggers = canvas.getAllByRole('button');

    await expect(triggers).toHaveLength(6);

    // Single-expand accordion: first item expanded, rest collapsed
    await expect(triggers[0]).toHaveAttribute('aria-expanded', 'true');
    await expect(triggers[1]).toHaveAttribute('aria-expanded', 'false');
    await expect(triggers[2]).toHaveAttribute('aria-expanded', 'false');

    // Multiple-expand accordion: first two items expanded, third collapsed
    await expect(triggers[3]).toHaveAttribute('aria-expanded', 'true');
    await expect(triggers[4]).toHaveAttribute('aria-expanded', 'true');
    await expect(triggers[5]).toHaveAttribute('aria-expanded', 'false');
  },
};

// ─── STATES ───────────────────────────────────────────────────────────────

export const STATES: Story = {
  name: 'States',
  render: () => ({
    template: `
      <div class="dcx-story-grid dcx-story-grid--rows">
        <div class="dcx-story-card">
          <h4 class="dcx-story-heading">Item states</h4>
          <p class="dcx-story-description">An accordion can contain items in different states simultaneously.</p>
          <ds-accordion [config]="{ allowMultipleExpanded: true }">
            <ds-accordion-item title="Active — expanded" [isInitiallyExpanded]="true">
              <p>This item is active and initially expanded. The user can collapse it.</p>
            </ds-accordion-item>
            <ds-accordion-item title="Active — collapsed">
              <p>This item is active and collapsed. Click to expand.</p>
            </ds-accordion-item>
            <ds-accordion-item title="Disabled — collapsed" [isDisabled]="true">
              <p>This item is disabled. The trigger cannot be activated.</p>
            </ds-accordion-item>
            <ds-accordion-item title="Disabled — expanded" [isInitiallyExpanded]="true" [isDisabled]="true">
              <p>This item is disabled but was initially expanded. It cannot be collapsed by the user.</p>
            </ds-accordion-item>
          </ds-accordion>
        </div>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const triggers = canvas.getAllByRole('button');

    await expect(triggers).toHaveLength(4);

    // Active — expanded
    await expect(triggers[0]).toHaveAttribute('aria-expanded', 'true');
    await expect(triggers[0]).toHaveAttribute('aria-disabled', 'false');

    // Active — collapsed
    await expect(triggers[1]).toHaveAttribute('aria-expanded', 'false');
    await expect(triggers[1]).toHaveAttribute('aria-disabled', 'false');

    // Disabled — collapsed
    await expect(triggers[2]).toHaveAttribute('aria-expanded', 'false');
    await expect(triggers[2]).toHaveAttribute('aria-disabled', 'true');

    // Disabled — expanded
    await expect(triggers[3]).toHaveAttribute('aria-expanded', 'true');
    await expect(triggers[3]).toHaveAttribute('aria-disabled', 'true');
  },
};

// ─── CONTENT_TYPES ────────────────────────────────────────────────────────

export const CONTENT_TYPES: Story = {
  name: 'Content types',
  render: () => ({
    template: `
      <div class="dcx-story-grid dcx-story-grid--rows">

        <div class="dcx-story-card">
          <h4 class="dcx-story-heading">Plain text</h4>
          <p class="dcx-story-description">Simple paragraph content projected into the accordion item.</p>
          <ds-accordion>
            <ds-accordion-item title="Plain text content" [isInitiallyExpanded]="true">
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla nec purus feugiat,
                molestie ipsum et, consequat nibh. Etiam non elit dui.
              </p>
            </ds-accordion-item>
          </ds-accordion>
        </div>

        <div class="dcx-story-card">
          <h4 class="dcx-story-heading">Rich HTML</h4>
          <p class="dcx-story-description">Formatted content with headings, lists, and inline elements.</p>
          <ds-accordion>
            <ds-accordion-item title="Rich HTML content" [isInitiallyExpanded]="true">
              <div>
                <p>Paragraph with <strong>bold</strong> and <em>italic</em> text.</p>
                <ul>
                  <li>First item in list</li>
                  <li>Second item in list</li>
                  <li>Third item with <strong>formatting</strong></li>
                </ul>
              </div>
            </ds-accordion-item>
          </ds-accordion>
        </div>

        <div class="dcx-story-card">
          <h4 class="dcx-story-heading">Multiple paragraphs</h4>
          <p class="dcx-story-description">Long-form content with multiple paragraphs.</p>
          <ds-accordion>
            <ds-accordion-item title="Multi-paragraph content" [isInitiallyExpanded]="true">
              <div>
                <p>First paragraph with introductory information about the topic.</p>
                <p>Second paragraph with more detailed information and context.</p>
                <p>Third paragraph concluding the section content.</p>
              </div>
            </ds-accordion-item>
          </ds-accordion>
        </div>

      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const triggers = canvas.getAllByRole('button');

    await expect(triggers).toHaveLength(3);

    // All items are initially expanded
    await expect(triggers[0]).toHaveAttribute('aria-expanded', 'true');
    await expect(triggers[1]).toHaveAttribute('aria-expanded', 'true');
    await expect(triggers[2]).toHaveAttribute('aria-expanded', 'true');

    // Expanded content regions are present in the DOM
    const regions = canvas.getAllByRole('region');

    await expect(regions).toHaveLength(3);
  },
};

// ─── PLAYGROUND ───────────────────────────────────────────────────────────

export const PLAYGROUND: Story = {
  name: '__Playground',
  parameters: {
    layout: 'padded',
  },
  args: {
    allowMultipleExpanded: false,
  } as Record<string, unknown>,
  argTypes: {
    allowMultipleExpanded: {
      control: 'boolean',
      name: 'Allow multiple expanded',
      description:
        'When true, multiple accordion items can be open simultaneously. When false (default), opening one item collapses the others.',
      table: {
        category: 'Behavior',
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    config: { table: { disable: true } },
    ngAfterContentInit: { table: { disable: true } },
    ngOnDestroy: { table: { disable: true } },
  } as Record<string, unknown>,
  render: (args) => {
    const customArgs = args as unknown as { allowMultipleExpanded: boolean };

    return {
      props: {
        accordionConfig: {
          allowMultipleExpanded: customArgs.allowMultipleExpanded,
        } as AccordionConfig,
      },
      template: `
        <ds-accordion [config]="accordionConfig">
          <ds-accordion-item title="First section" [isInitiallyExpanded]="true">
            <p>This is the content of the first section.</p>
          </ds-accordion-item>
          <ds-accordion-item title="Second section">
            <p>This is the content of the second section. Try toggling "Allow multiple expanded" in the controls panel.</p>
          </ds-accordion-item>
          <ds-accordion-item title="Third section">
            <p>This is the content of the third section.</p>
          </ds-accordion-item>
        </ds-accordion>
      `,
    };
  },
};
