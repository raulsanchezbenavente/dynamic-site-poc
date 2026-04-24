
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { STORYBOOK_PROVIDERS } from '../../../../../stories/providers/storybook.providers';
import { DsSummaryRendererComponent } from '@dcx/storybook/design-system';

// More on how to set up stories at: https://storybook.js.org/docs/7.0/angular/writing-stories/introduction
const META: Meta<DsSummaryRendererComponent> = {
  title: 'Molecules/Summary/Summary Renderer',
  component: DsSummaryRendererComponent,
  tags: ['autodocs'],
  render: (args) => ({
    props: {
      ...args,
    },
  }),
  decorators: [
    moduleMetadata({
      imports: [DsSummaryRendererComponent],
      providers: STORYBOOK_PROVIDERS,
    }),
  ],
};

export default META;
type Story = StoryObj<DsSummaryRendererComponent>;

export const WITH_CUSTOM_TEMPLATE: Story = {
  name: 'Custom Template',
  render: (args) => ({
    props: args,
    template: `
      <ds-summary-renderer [config]="config">
        <div class="card border-secondary shadow-sm">
          <div class="h4 bold p-3">My Summary</div>
          <div class="card-body">
            📝 <b summary-data-label="name"></b><br />
            👉 <span summary-data-value="name"></span>
            <hr />
            🧑‍💼 <b summary-data-label="surname"></b><br />
            ✨ <span summary-data-value="surname"></span>
            <hr />
            📧 <b summary-data-label="email"></b><br />
            ✉️ <span summary-data-value="email"></span>
          </div>
        </div>
      </ds-summary-renderer>
    `,
  }),
  args: {
    config: {
      name: { label: 'Name', value: 'Juan' },
      surname: { label: 'Surname', value: 'Pérez' },
      email: { label: 'Email', value: 'juan@example.com' },
    },
  },
};
