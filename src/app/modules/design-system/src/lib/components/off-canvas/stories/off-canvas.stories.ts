import { Component, Input } from '@angular/core';
import type { OffCanvasConfig } from '@dcx/storybook/design-system';
import { OffCanvasBodyDirective, OffCanvasComponent } from '@dcx/storybook/design-system';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { expect, userEvent, within } from '@storybook/test';

import { STORYBOOK_PROVIDERS } from '../../../../stories/providers/storybook.providers';

@Component({
  selector: 'mock-storybook-offcanvas',
  template: `
    <button
      class="btn btn-primary"
      [attr.aria-expanded]="isOpen"
      (click)="openOffcanvas()">
      {{ buttonLabel }}
    </button>
    @if (isOpen) {
      <off-canvas
        [config]="offCanvasConfig"
        (isOpenChange)="handleOpenChange($event)"
        (offcanvasClosedEmitter)="handleClose()">
        <off-canvas-header>
          <p>Header Content</p>
        </off-canvas-header>
        <div offCanvasBody>
          <p>
            One morning, when Gregor Samsa woke from troubled dreams, he found himself transformed in his bed into a
            horrible vermin.
          </p>
          <p>
            He lay on his armour-like back, and if he lifted his head a little he could see his brown belly, slightly
            domed and divided by arches into stiff sections. The bedding was hardly able to cover it and seemed ready to
            slide off any moment.
          </p>
          <p>
            His many legs, pitifully thin compared with the size of the rest of him, waved about helplessly as he
            looked. "What's happened to me? " he thought. It wasn't a dream. His room, a proper human room although a
            little too small, lay peacefully between its four familiar walls.
          </p>
        </div>
      </off-canvas>
    }
  `,
  imports: [OffCanvasComponent, OffCanvasBodyDirective],
  standalone: true,
})
class StorybookOffCanvasComponent {
  @Input({ required: true }) public offCanvasConfig!: Partial<OffCanvasConfig>;
  @Input() public buttonLabel: string = 'Open Offcanvas';

  public isOpen: boolean = false;

  public openOffcanvas(): void {
    this.isOpen = !this.isOpen;
  }

  public handleOpenChange(isOpen: boolean): void {
    this.isOpen = isOpen;
  }

  public handleClose(): void {
    this.isOpen = false;
  }
}

const META: Meta<OffCanvasComponent> = {
  title: 'Atoms/OffCanvas',
  component: OffCanvasComponent,
  render: (args) => ({
    props: args,
    template: `
      <mock-storybook-offcanvas [offCanvasConfig]="offCanvasConfig"></mock-storybook-offcanvas>
    `,
  }),
  parameters: {
    i18nModules: ['Common'],
    i18n: {
      api: false,
      mock: {},
    },
  },
  decorators: [
    moduleMetadata({
      imports: [NgbModule, StorybookOffCanvasComponent],
      providers: STORYBOOK_PROVIDERS,
    }),
  ],
};

export default META;
type Story = StoryObj<StorybookOffCanvasComponent>;

const DEFAULT_CONFIG: Partial<OffCanvasConfig> = {
  offCanvasHeaderConfig: {
    title: 'Upgrade options',
    subtitle: 'Add seats or extras',
  },
};

const HEADER_VARIANTS: Partial<OffCanvasConfig>[] = [
  {
    offCanvasHeaderConfig: {
      title: 'Text title',
      subtitle: 'Inline description',
    },
  },
  {
    offCanvasHeaderConfig: {
      title: 'fare club image',
      imageSrc: 'https://placehold.co/300x32?text=Fare Club Logo',
    },
  },
];

const POSITION_VARIANTS: Partial<OffCanvasConfig>[] = [
  DEFAULT_CONFIG,
  {
    offCanvasHeaderConfig: {
      title: 'Top entrance',
    },
    position: 'top',
  },
  {
    offCanvasHeaderConfig: {
      title: 'Left entrance',
    },
    position: 'start',
  },
  {
    offCanvasHeaderConfig: {
      title: 'Right entrance',
    },
    position: 'end',
  },
];

const POSITION_LABELS = ['Open bottom panel', 'Open top panel', 'Open left panel', 'Open right panel'];

const HEADER_LABELS = ['Open text header panel', 'Open image header panel'];

export const PLAYGROUND: Story = {
  name: 'Playground',
  parameters: {
    layout: 'centered',
  },
  args: {
    position: 'end',
    scroll: true,
    animation: true,
    title: 'Manage booking',
    subtitle: 'Upgrade seats or add extras',
    imageSrc: undefined,
    iconName: undefined,
    panelClass: 'ds-off-canvas__panel',
    backdropClass: undefined,
  } as Record<string, unknown>,
  argTypes: {
    position: {
      control: 'radio',
      options: ['start', 'end', 'top', 'bottom'],
      name: 'Position',
      table: {
        category: 'Layout',
        type: { summary: '"start" | "end" | "top" | "bottom"' },
      },
    },
    scroll: {
      control: 'boolean',
      name: 'Allow Body Scroll',
      table: {
        category: 'Behavior',
        type: { summary: 'boolean' },
      },
    },
    animation: {
      control: 'boolean',
      name: 'Animation',
      table: {
        category: 'Behavior',
        type: { summary: 'boolean' },
      },
    },
    title: {
      control: 'text',
      name: 'Header Title',
      table: {
        category: 'Header',
        type: { summary: 'string' },
      },
    },
    subtitle: {
      control: 'text',
      name: 'Header Subtitle',
      table: {
        category: 'Header',
        type: { summary: 'string | undefined' },
      },
    },
    imageSrc: {
      control: 'text',
      name: 'Header Image Src',
      table: {
        category: 'Header',
        type: { summary: 'string | undefined' },
      },
    },
    iconName: {
      control: 'text',
      name: 'Header Icon Name',
      table: {
        category: 'Header',
        type: { summary: 'string | undefined' },
      },
    },
    panelClass: {
      control: 'text',
      name: 'Panel Class',
      table: {
        category: 'Appearance',
        type: { summary: 'string | string[] | undefined' },
      },
    },
    backdropClass: {
      control: 'text',
      name: 'Backdrop Class',
      table: {
        category: 'Appearance',
        type: { summary: 'string | string[] | undefined' },
      },
    },
    config: { table: { disable: true } },
    offcanvasClosedEmitter: { table: { disable: true } },
    handleOpenChange: { table: { disable: true } },
    handleClose: { table: { disable: true } },
    openOffcanvas: { table: { disable: true } },
    isOpen: { table: { disable: true } },
    offcanvasRef: { table: { disable: true } },
    dismiss: { table: { disable: true } },
    initDefaultConfiguration: { table: { disable: true } },
    ngAfterViewInit: { table: { disable: true } },
    ngOnDestroy: { table: { disable: true } },
    ngOnInit: { table: { disable: true } },
    open: { table: { disable: true } },
    subcribeToOffcanvasClosed: { table: { disable: true } },
    content: { table: { disable: true } },
  } as Record<string, unknown>,
  render: (args) => {
    const PLAYGROUND_ARGS = args as unknown as {
      position: 'start' | 'end' | 'top' | 'bottom';
      scroll: boolean;
      animation: boolean;
      title: string;
      subtitle?: string;
      imageSrc?: string;
      iconName?: string;
      panelClass?: string;
      backdropClass?: string;
    };

    return {
      template: `
        <div style="display:flex; justify-content:center;">
          <mock-storybook-offcanvas [offCanvasConfig]="config"></mock-storybook-offcanvas>
        </div>
      `,
      props: {
        config: {
          position: PLAYGROUND_ARGS.position,
          scroll: PLAYGROUND_ARGS.scroll,
          animation: PLAYGROUND_ARGS.animation,
          panelClass: PLAYGROUND_ARGS.panelClass,
          backdropClass: PLAYGROUND_ARGS.backdropClass,
          offCanvasHeaderConfig: {
            title: PLAYGROUND_ARGS.title,
            subtitle: PLAYGROUND_ARGS.subtitle,
            ...(PLAYGROUND_ARGS.imageSrc && { imageSrc: PLAYGROUND_ARGS.imageSrc }),
            ...(PLAYGROUND_ARGS.iconName && { icon: { name: PLAYGROUND_ARGS.iconName } }),
          },
        },
      },
    };
  },
};

export const POSITIONS: Story = {
  name: 'Positions',
  render: () => ({
    template: `
      <div style="display:flex; gap:16px; flex-wrap:wrap;">
        <mock-storybook-offcanvas [offCanvasConfig]="positionConfigs[0]" [buttonLabel]="positionLabels[0]"></mock-storybook-offcanvas>
        <mock-storybook-offcanvas [offCanvasConfig]="positionConfigs[1]" [buttonLabel]="positionLabels[1]"></mock-storybook-offcanvas>
        <mock-storybook-offcanvas [offCanvasConfig]="positionConfigs[2]" [buttonLabel]="positionLabels[2]"></mock-storybook-offcanvas>
        <mock-storybook-offcanvas [offCanvasConfig]="positionConfigs[3]" [buttonLabel]="positionLabels[3]"></mock-storybook-offcanvas>
      </div>
    `,
    props: {
      positionConfigs: POSITION_VARIANTS,
      positionLabels: POSITION_LABELS,
    },
  }),
  play: async ({ canvasElement }) => {
    const CANVAS = within(canvasElement);
    const BUTTONS = await CANVAS.findAllByRole('button', { name: 'Open Offcanvas' });
    await expect(BUTTONS).toHaveLength(4);

    const USER = userEvent.setup();
    await USER.click(BUTTONS[0]);
    await expect(document.body.querySelector('.offcanvas-bottom')).toBeTruthy();
    await USER.click(document.body.querySelector('button.btn-close') as HTMLButtonElement);
  },
};

export const HEADERS: Story = {
  name: 'Header Styles',
  render: () => ({
    template: `
      <div style="display:flex; gap:16px; flex-wrap:wrap;">
        <mock-storybook-offcanvas [offCanvasConfig]="headerConfigs[0]" [buttonLabel]="headerLabels[0]"></mock-storybook-offcanvas>
        <mock-storybook-offcanvas [offCanvasConfig]="headerConfigs[1]" [buttonLabel]="headerLabels[1]"></mock-storybook-offcanvas>
      </div>
    `,
    props: {
      headerConfigs: HEADER_VARIANTS,
      headerLabels: HEADER_LABELS,
    },
  }),
  play: async ({ canvasElement }) => {
    const CANVAS = within(canvasElement);
    const BUTTONS = await CANVAS.findAllByRole('button');
    await expect(BUTTONS).toHaveLength(2);
  },
};
