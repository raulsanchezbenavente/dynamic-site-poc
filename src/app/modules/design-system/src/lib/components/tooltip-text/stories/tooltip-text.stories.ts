import { IconComponent, TooltipTextComponent } from '@dcx/storybook/design-system';
import { GenerateIdPipe } from '@dcx/ui/libs';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

// More on how to set up stories at: https://storybook.js.org/docs/7.0/angular/writing-stories/introduction
const META: Meta<TooltipTextComponent> = {
  title: 'Atoms/Tooltip Text',
  component: TooltipTextComponent,
  tags: ['autodocs'],
  render: (args) => ({
    props: {
      ...args,
    },
  }),
  argTypes: {},
  decorators: [
    moduleMetadata({
      imports: [NgbModule, TooltipTextComponent],
      providers: [GenerateIdPipe],
    }),
  ],
};

export default META;
type Story = StoryObj<TooltipTextComponent>;

export const DEFAULT: Story = {
  name: 'Default Tooltip (Top)',
  args: {
    tooltip: 'Pepito de las casas',
    position: 'top',
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="padding: 40px; text-align:center;">
        <tooltip-text [tooltip]="tooltip" [position]="position">
          <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: inline-block; max-width: 90px;">
            Pepito de las casas
          </span>
        </tooltip-text>
      </div>
    `,
  }),
};

export const TOOLTIP_BOTTOM_POSITION: Story = {
  name: 'Position: Bottom',
  args: {
    tooltip: 'This tooltip appears below the text.',
    position: 'bottom',
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="padding: 40px; text-align:center;">
        <tooltip-text [tooltip]="tooltip" [position]="position">
          <span>Hover me (bottom)</span>
        </tooltip-text>
      </div>
    `,
  }),
};

export const TOOLTIP_LEFT_RIGHT_POSITION: Story = {
  name: 'Position: Left and Right',
  render: () => ({
    template: `
      <div style="padding: 40px; text-align:center;">
        <tooltip-text tooltip="Tooltip on the left" position="left">
          <span>Left</span>
        </tooltip-text>
        <br /><br />
        <tooltip-text tooltip="Tooltip on the right" position="right">
          <span>Right</span>
        </tooltip-text>
      </div>
    `,
  }),
};
