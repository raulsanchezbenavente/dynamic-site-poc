import {
  DsButtonComponent,
  IconComponent,
  PanelAppearance,
  PanelComponent,
  PanelContentDirective,
  PanelDescriptionDirective,
  PanelFooterDirective,
  PanelHeaderAsideDirective,
  PanelHeaderComponent,
  PanelIconDirective,
  PanelTitleDirective,
} from '@dcx/storybook/design-system';
import type { IconConfig } from '@dcx/ui/libs';
import { HorizontalAlign, SectionColors } from '@dcx/ui/libs';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { STORYBOOK_PROVIDERS } from '../../../../stories/providers/storybook.providers';

// More on how to set up stories at: https://storybook.js.org/docs/7.0/angular/writing-stories/introduction
const META: Meta<PanelComponent> = {
  title: 'Molecules/Panel',
  component: PanelComponent,
  tags: ['autodocs'],
  render: (args) => ({
    props: {
      ...args,
    },
  }),
  decorators: [
    moduleMetadata({
      imports: [
        DsButtonComponent,
        IconComponent,
        PanelComponent,
        PanelContentDirective,
        PanelDescriptionDirective,
        PanelFooterDirective,
        PanelHeaderAsideDirective,
        PanelHeaderComponent,
        PanelIconDirective,
        PanelTitleDirective,
      ],
      providers: STORYBOOK_PROVIDERS,
    }),
  ],
};

export default META;
type Story = StoryObj<PanelComponent>;

const COMMON_PANEL_TEMPLATE = `
  <panel [config]="config">
    <panel-header>
      <h3 panelTitle>
        <span panelIcon>
          <icon [config]="panelIicon"></icon>
        </span>
        Here goes the panel title using H3 heading tag. Example with a very large content title
      </h3>
      <div panelDescription>
        Here's a text to show panel description content. Should not be a very long text.
      </div>
      <div panelHeaderAside>
        PanelHeader aside content
      </div>
    </panel-header>
    <div panelContent>
      <p>
        This panel configuration example includes a header with panelTitle, panelIcon, and panelDescription
        content projection options.
        <br>It also supports PanelHeader Aside content, displayed to the left of the title,
        and allows content projection for the entire panel content. Everything is implemented by the parent
        component using content projection.
        <br>It also supports PanelHeader Aside content, which is displayed to the left of the title,
        and allows content projection for the entire panel content.
      </p>
      <p>Everything is implemented by the parent component using content projection.</p>
    </div>
    <div panelFooter>
      <ds-button [config]="{
        label: 'Button 1',
        icon: {name: 'plus-circle-outline'},
        layout: {size: 'small', style: 'link'}
      }" />

      <ds-button [config]="{
        label: 'Button 2',
        icon: {name: 'plus-circle-outline'},
        layout: {size: 'small', style: 'link'}
      }" />
    </div>
  </panel>
`;

// Template for simple content, useful for content alignments
const SIMPLE_PANEL_CONTENT_TEMPLATE = `
  <div panelContent>
    <p>This is the panel content.
    <br />It aligns according to the <b>contentHorizontalAlign</b> configuration.</p>
  </div>
`;

const DEFAULT_PANEL_ARGS = {
  panelIicon: { name: 'email' } as IconConfig,
};

// Panel default: Without applying any specific appearance beyond the base
export const DEFAULT_PANEL: Story = {
  name: 'Default (maximun scenario)',
  args: {
    ...DEFAULT_PANEL_ARGS,
    config: {
      appearance: PanelAppearance.DEFAULT,
    },
  },
  render: (args) => ({
    template: COMMON_PANEL_TEMPLATE,
    props: {
      ...args,
    },
  }),
};

// Panel shadow: Applying a shadow effect to the panel
export const SHADOW_PANEL: Story = {
  name: 'Appearance: Shadow',
  args: {
    ...DEFAULT_PANEL_ARGS,
    config: {
      appearance: PanelAppearance.SHADOW,
    },
  },
  render: (args) => ({
    template: COMMON_PANEL_TEMPLATE,
    props: {
      ...args,
    },
  }),
};

// Panel border: Adding a border to the panel
export const BORDER_PANEL: Story = {
  name: 'Appearance: Border',
  args: {
    ...DEFAULT_PANEL_ARGS,
    config: {
      appearance: PanelAppearance.BORDER,
    },
  },
  render: (args) => ({
    template: COMMON_PANEL_TEMPLATE,
    props: {
      ...args,
    },
  }),
};

// Panel bgfill: Applying a background fill to the panel
export const BGFILL_PANEL: Story = {
  name: 'Appearance: Bgfill',
  args: {
    ...DEFAULT_PANEL_ARGS,
    config: {
      appearance: PanelAppearance.BGFILL,
    },
  },
  render: (args) => ({
    template: `
      ${COMMON_PANEL_TEMPLATE}
      <div style="z-index: -1;position: absolute; top:0; left:0; width:100%; height: 100%; background-color: #fff;"></div>
    `,
    props: {
      ...args,
    },
  }),
};

// SectionColors: Border top styles
export const SECTION_COLORS_PANEL: Story = {
  name: 'Section Colors (with Shadow Styles)',
  render: () => ({
    template: `
      <h1 class="context-h2" style="margin-top: 0;">Panel Section Colors</h1>
      <h2 class="context-h3">Booking Section Color</h2>
      <panel [config]="configBooking">
        <panel-header>
          <h3 panelTitle>Booking Panel Title</h3>
        </panel-header>
        <div panelContent>
          <p>This panel uses the 'Booking' section color.</p>
        </div>
      </panel>

      <br>

      <h2 class="context-h3">Info Section Color</h2>
      <panel [config]="configInfo">
        <panel-header>
          <h3 panelTitle>Info Panel Title</h3>
        </panel-header>
        <div panelContent>
          <p>This panel uses the 'Info' section color.</p>
        </div>
      </panel>

      <br>

      <h2 class="context-h3">Offer Section Color</h2>
      <panel [config]="configOffer">
        <panel-header>
          <h3 panelTitle>Offer Panel Title</h3>
        </panel-header>
        <div panelContent>
          <p>This panel uses the 'Offer' section color.</p>
        </div>
      </panel>
      `,
    props: {
      configBooking: {
        appearance: PanelAppearance.SHADOW,
        sectionsColors: SectionColors.BOOKING,
      },
      configInfo: {
        appearance: PanelAppearance.SHADOW,
        sectionsColors: SectionColors.INFO,
      },
      configOffer: {
        appearance: PanelAppearance.SHADOW,
        sectionsColors: SectionColors.OFFER,
      },
    },
  }),
};

// Panel headerHorizontalAlign
export const HEADER_ALIGNMENT_PANEL: Story = {
  name: 'Header Alignment',
  render: () => ({
    template: `
      <h1 class="context-h2" style="margin-top: 0;">Panel Header Horizontal Alignment</h1>
      <p>This configuration affects only <strong>header</strong>, not content alignment.<p>

      <h2 class="context-h3">Header Left Alignment (Default)</h2>
      <panel [config]="configHeaderLeft">
        <panel-header>
          <h3 panelTitle>
            <span panelIcon><icon [config]="panelIicon"></icon></span>
            Left Aligned Title
          </h3>
          <div panelDescription>Header description aligned to the left.</div>
          <div panelHeaderAside>Aside Left</div>
        </panel-header>
        ${SIMPLE_PANEL_CONTENT_TEMPLATE}
      </panel>

      <br>

      <h2 class="context-h3">Header Center Alignment</h2>
      <panel [config]="configHeaderCenter">
        <panel-header>
          <h3 panelTitle>
            <span panelIcon><icon [config]="panelIicon"></icon></span>
            Center Aligned Title
          </h3>
          <div panelDescription>Header escription aligned to the center.</div>
        </panel-header>
        ${SIMPLE_PANEL_CONTENT_TEMPLATE}
      </panel>

      <h2 class="context-h3">Header Center Alignment (with aside content)</h2>
      <panel [config]="configHeaderCenter">
        <panel-header>
          <h3 panelTitle>
            <span panelIcon><icon [config]="panelIicon"></icon></span>
            Center Aligned Title
          </h3>
          <div panelDescription>Header escription aligned to the center.</div>
          <div panelHeaderAside>Aside Left</div>
        </panel-header>
        ${SIMPLE_PANEL_CONTENT_TEMPLATE}
      </panel>

      <br>

      <h2 class="context-h3">Header Right Alignment</h2>
      <panel [config]="configHeaderRight">
        <panel-header>
          <h3 panelTitle>
            <span panelIcon><icon [config]="panelIicon"></icon></span>
            Right Aligned Title
          </h3>
          <div panelDescription>Header description aligned to the right.</div>
        </panel-header>
        ${SIMPLE_PANEL_CONTENT_TEMPLATE}
      </panel>

      <br /><br />
    `,
    props: {
      panelIicon: DEFAULT_PANEL_ARGS.panelIicon,
      configHeaderLeft: {
        appearance: PanelAppearance.SHADOW,
      },
      configHeaderCenter: {
        appearance: PanelAppearance.SHADOW,
        layoutConfig: {
          headerHorizontalAlign: HorizontalAlign.CENTER,
        },
      },
      configHeaderRight: {
        appearance: PanelAppearance.SHADOW,
        layoutConfig: {
          headerHorizontalAlign: HorizontalAlign.RIGHT,
        },
      },
    },
  }),
};

// Panel contentHorizontalAlign
export const CONTENT_ALIGNMENT_PANEL: Story = {
  name: 'Content Alignment',
  render: () => ({
    template: `
      <h1 class="context-h2" style="margin-top: 0;">Panel Content Horizontal Alignment</h1>
      <p>This configuration affects only <strong>content</strong>, not header alignment.<p>

      <h2 class="context-h3">Content Left Alignment (Default)</h2>
      <panel [config]="configContentLeft">
        <panel-header>
          <h3 panelTitle>Panel Title</h3>
        </panel-header>
        <div panelContent>
          <p>This is an example paragraph aligned to the left.<br />The panel content adjusts according to the alignment configuration.</p>
        </div>
      </panel>

      <br>

      <h2 class="context-h3">Content Center Alignment</h2>
      <panel [config]="configContentCenter">
        <panel-header>
          <h3 panelTitle>Panel Title</h3>
        </panel-header>
        <div panelContent>
          <p>This is an example paragraph aligned to the center.<br />The panel content adjusts according to the alignment configuration.</p>
        </div>
      </panel>

      <br>

      <h2 class="context-h3">Content Right Alignment</h2>
      <panel [config]="configContentRight">
        <panel-header>
          <h3 panelTitle>Panel Title</h3>
        </panel-header>
        <div panelContent>
          <p>This is an example paragraph aligned to the right.<br />The panel content adjusts according to the alignment configuration.</p>
        </div>
      </panel>

      <br /><br />
    `,
    props: {
      configContentLeft: {
        appearance: PanelAppearance.SHADOW,
      },
      configContentCenter: {
        appearance: PanelAppearance.SHADOW,
        layoutConfig: {
          contentHorizontalAlign: HorizontalAlign.CENTER,
        },
      },
      configContentRight: {
        appearance: PanelAppearance.SHADOW,
        layoutConfig: {
          contentHorizontalAlign: HorizontalAlign.RIGHT,
        },
      },
    },
  }),
};

export const NESTED_PANELS: Story = {
  name: 'Nested Panels',
  render: () => ({
    template: `
      <h1 class="context-h2" style="margin-top: 0;">Nested Panels Layout</h1>

      <panel [config]="nestedParentConfig">
        <panel-header>
          <h3 panelTitle>Parent Panel</h3>
        </panel-header>
        <panel [config]="nestedBorderStyle">
          <panel-header>
            <h3 panelTitle>Inside Panel (Border Appearance)</h3>
          </panel-header>
          <div panelContent>
            <p>When there is a Panel inside another Panel, the nested panels gets <strong>padding 24px</strong>.</p>
          </div>
        </panel>
        <panel [config]="nestedBgFillStyle">
          <panel-header>
            <h3 panelTitle>Inside Panel (Bgfill Appearance)</h3>
          </panel-header>
          <div panelContent>
            <p>When there is a Panel inside another Panel, the nested panels gets <strong>padding 24px</strong>.</p>
          </div>
        </panel>
      </panel>

      <br />
      <panel [config]="nestedParentConfig">
        <panel-header>
          <h3 panelTitle>Parent Panel</h3>
        </panel-header>
        <panel [config]="nestedConfig">
          <panel-header>
            <h3 panelTitle>Inside Panel (Default Appearance)</h3>
          </panel-header>
          <div panelContent>
          <p>In Default Appearace Panel as nested of a Shadow Panel the case is diferent.<br/>The nested Panel Default gets <strong>padding 0</strong>.</p>
          </div>
        </panel>
      </panel>




      <br /><br />
    `,
    props: {
      nestedParentConfig: {
        appearance: PanelAppearance.SHADOW,
      },
      nestedBorderStyle: {
        appearance: PanelAppearance.BORDER,
      },
      nestedBgFillStyle: {
        appearance: PanelAppearance.BGFILL,
      },
    },
  }),
};

export const PANEL_USE_OF_ARIA_LABEL: Story = {
  name: 'Panel Use of Aria Label When There is no PanelTitle',
  render: () => ({
    template: `
      <h2 class="context-h3">If there is no PanelTitle use AriaLabel if the Panel must be a role=region element</h2>
      <panel [config]="configAriaLabel">
        <div panelContent>
          <p>This panel uses the 'Booking' section color.</p>
        </div>
      </panel>

      <br>
      `,
    props: {
      configAriaLabel: {
        appearance: PanelAppearance.SHADOW,
        ariaAttributes: { ariaLabel: 'Informative panel with header and content sections' },
      },
    },
  }),
};

export const PANEL_USE_OF_CUSTOM_ARIALABELLED_BY: Story = {
  name: 'Use of custom aria-labelledby value',
  render: () => ({
    template: `
      <h2 class="context-h3" id="customTitleId">Set a custom aria-labelledby value</h2>
      <panel [config]="configCustomAriaLabelledBy">
        <panel-header>
          <h3 panelTitle>Offer Panel Title</h3>
        </panel-header>
        <div panelContent>
          <p>This panel uses the 'Booking' section color.</p>
        </div>
      </panel>

      <br>
      `,
    props: {
      configCustomAriaLabelledBy: {
        appearance: PanelAppearance.SHADOW,
        ariaAttributes: { ariaLabelledBy: 'customTitleId' },
      },
    },
  }),
};
