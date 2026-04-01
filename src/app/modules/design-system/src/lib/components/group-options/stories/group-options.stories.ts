import { DsGroupOptionsComponent } from '@dcx/storybook/design-system';
import { LinkTarget } from '@dcx/ui/libs';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { expect } from '@storybook/test';

import { STORYBOOK_PROVIDERS } from '../../../../stories/providers/storybook.providers';
import type { GroupOptionElementData } from '../components/models/group-option-element.model';
import { GroupOptionsTemplateStyles } from '../enums/template-styles.enum';

const META: Meta<DsGroupOptionsComponent> = {
  title: 'Organisms/Group Options',
  component: DsGroupOptionsComponent,
  render: (args) => ({
    props: args,
  }),
  decorators: [
    moduleMetadata({
      imports: [DsGroupOptionsComponent],
      providers: STORYBOOK_PROVIDERS,
    }),
  ],
};

export default META;
type Story = StoryObj<DsGroupOptionsComponent>;

// Base mock data - reusable elements
const BASE_SVG_OPTION_HELP: GroupOptionElementData = {
  title: 'Help Center',
  description: 'Find useful information to answer your questions.',
  image: {
    src: '//static.avianca.com/media/1239/centro-de-ayuda.svg',
    altText: 'Magnifying glass icon',
  },
  link: {
    url: 'https://www.avianca.com/help',
    target: LinkTarget.BLANK,
  },
};

const BASE_SVG_OPTION_CHECKIN: GroupOptionElementData = {
  title: 'Online Check-in',
  description: 'Get your boarding pass and save time at the airport.',
  image: {
    src: '//static.avianca.com/media/1240/check-in.svg',
    altText: 'Check-in icon',
  },
  link: {
    url: 'https://www.avianca.com/check-in',
  },
};

const BASE_SVG_OPTION_REQUIREMENTS: GroupOptionElementData = {
  title: 'Travel Requirements',
  description: 'Learn about visas, vaccines and other required documents.',
  image: {
    src: '//static.avianca.com/media/1204/requisitos-para-viajar.svg',
    altText: 'Travel documents icon',
  },
  link: {
    url: 'https://www.avianca.com/requirements',
  },
};

const BASE_SVG_OPTION_FLIGHT_STATUS: GroupOptionElementData = {
  title: 'Flight Status',
  description: 'Track your flight in real-time and get arrival updates.',
  image: {
    src: '//static.avianca.com/media/1242/flight-status.svg',
    altText: 'Airplane tracking icon',
  },
  link: {
    url: 'https://www.avianca.com/flight-status',
  },
};

const BASE_JPG_OPTION_DESTINATIONS: GroupOptionElementData = {
  title: 'New Destinations',
  description: 'Explore our newest routes to exciting cities across the Americas.',
  image: {
    src: '//static.avianca.com/media/1055/informacionn-sobre-documentos-requisitos-viajar.webp',
    altText: 'Destinations banner',
  },
  link: {
    url: 'https://www.avianca.com/destinations',
  },
};

const BASE_JPG_OPTION_OFFERS: GroupOptionElementData = {
  title: 'Special Offers',
  description: 'Save up to 40% on select routes. Limited time deals.',
  image: {
    src: '//static.avianca.com/media/rtqjtufx/image-119-generica-min.jpg',
    altText: 'Promotional offers banner',
  },
  link: {
    url: 'https://www.avianca.com/offers',
  },
};

const BASE_JPG_OPTION_UPGRADES: GroupOptionElementData = {
  title: 'Cabin Upgrades',
  description: 'Experience premium comfort with business class upgrades.',
  image: {
    src: '//static.avianca.com/media/s5te0gim/eur-business.jpg',
    altText: 'Business class cabin banner',
  },
  link: {
    url: 'https://www.avianca.com/upgrades',
  },
};

// Composed mock arrays - reusing base elements
const SVG_OPTIONS_2_ITEMS: GroupOptionElementData[] = [BASE_SVG_OPTION_HELP, BASE_SVG_OPTION_CHECKIN];

const SVG_OPTIONS: GroupOptionElementData[] = [
  BASE_SVG_OPTION_HELP,
  BASE_SVG_OPTION_CHECKIN,
  BASE_SVG_OPTION_REQUIREMENTS,
];

const SVG_OPTIONS_NON_CLICKABLE: GroupOptionElementData[] = [
  {
    title: 'Hotel Booking',
    description: 'Earn or redeem miles easily with our <a href="#">LifeMiles hotel search engine</a>.',
    image: {
      src: '//static.avianca.com/media/1178/icon-hoteles.svg',
      altText: 'Hotel with five stars icon',
    },
  },
  {
    title: 'Car Rental',
    description: 'Get up to 15% discount on your next destination with <a href="#">Rentalcars.com</a>.',
    image: {
      src: '//static.avianca.com/media/1179/icon-alquiler-autos.svg',
      altText: 'Car rental icon',
    },
  },
  {
    title: 'Tours & Activities',
    description: 'Discover activities in top tourist destinations worldwide with <a href="#">Civitatis</a>.',
    image: {
      src: '//static.avianca.com/media/1181/icon-civitatis.svg',
      altText: 'Tourist landmarks icon',
    },
  },
];

const SVG_OPTIONS_WITH_BUTTON: GroupOptionElementData[] = [
  {
    ...BASE_SVG_OPTION_HELP,
    buttonText: 'Get Help',
  },
  {
    ...BASE_SVG_OPTION_CHECKIN,
    buttonText: 'Check In Now',
  },
  {
    ...BASE_SVG_OPTION_REQUIREMENTS,
    buttonText: 'View Requirements',
  },
];

const SVG_OPTIONS_4_ITEMS: GroupOptionElementData[] = [
  BASE_SVG_OPTION_HELP,
  BASE_SVG_OPTION_CHECKIN,
  BASE_SVG_OPTION_REQUIREMENTS,
  BASE_SVG_OPTION_FLIGHT_STATUS,
];

const JPG_OPTIONS_DEFAULT: GroupOptionElementData[] = [
  BASE_JPG_OPTION_DESTINATIONS,
  BASE_JPG_OPTION_OFFERS,
  BASE_JPG_OPTION_UPGRADES,
];

const JPG_OPTIONS_EDGE_ALIGNED: GroupOptionElementData[] = [
  { ...BASE_JPG_OPTION_DESTINATIONS, imageEdgeAligned: true },
  { ...BASE_JPG_OPTION_OFFERS, imageEdgeAligned: true },
  { ...BASE_JPG_OPTION_UPGRADES, imageEdgeAligned: true },
];

const COMPACT_OPTIONS_SEAT: GroupOptionElementData = {
  title: 'Elige tu asiento',
  description: 'Selecciona tu asiento favorito',
  image: {
    src: '//static.avianca.com/media/1002/seat.svg',
    altText: 'Seat selection icon',
  },
  link: {
    url: '#',
  },
};

const COMPACT_OPTIONS_BAGGAGE: GroupOptionElementData = {
  title: 'Equipaje adicional',
  description: 'Añade el equipaje que necesites',
  image: {
    src: 'https://av-static-test2.newshore.es/media/lsxbvrfn/baggage.svg',
    altText: 'Baggage icon',
  },
  link: {
    url: '#',
  },
};

const COMPACT_OPTIONS_PASSENGERS: GroupOptionElementData = {
  title: 'Editar información de pasajeros',
  description: 'Revisa y modifica los datos ingresados',
  image: {
    src: 'https://av-static-test2.newshore.es/media/c4hnp1q2/illustration.svg',
    altText: 'Passenger information icon',
  },
  link: {
    url: '#',
  },
};

const COMPACT_OPTIONS_SERVICES: GroupOptionElementData = {
  title: 'Gestionar servicios adicionales',
  description: 'Añade tu abordaje prioritario, acceso a avianca lounges y más',
  image: {
    src: 'https://static.avianca.com/media/1002/priority-boarding.svg',
    altText: 'Additional services icon',
  },
  link: {
    url: '#',
  },
};

const COMPACT_OPTIONS: GroupOptionElementData[] = [
  COMPACT_OPTIONS_SEAT,
  COMPACT_OPTIONS_BAGGAGE,
  COMPACT_OPTIONS_PASSENGERS,
  COMPACT_OPTIONS_SERVICES,
];

const IMAGE_FULLCOVER_OPTIONS: GroupOptionElementData[] = [
  {
    title: 'Gana 1,000 millas',
    description: 'creando tu cuenta Lifemiles<br>y comprando en avianca.com',
    image: {
      src: 'https://static.avianca.com/media/js1flo1g/card-lifemiles-v6.jpg',
      altText: 'Campaña gana millas',
    },
    buttonText: 'Únete ahora',
    link: {
      url: 'https://www.avianca.com/co/es/lifemiles/',
      target: LinkTarget.BLANK,
    },
  },
  {
    title: '¡Dona tus millas!',
    description: 'Transformemos vidas y<br>ecosistemas una milla a la vez.',
    image: {
      src: 'https://static.avianca.com/media/jjhn12xl/dona-millas-v5.jpg',
      altText: 'Suscripción a Lifemiles plus',
    },
    buttonText: 'Suscríbete ya',
    link: {
      url: 'https://www.lifemiles.com/',
      target: LinkTarget.BLANK,
    },
  },
  {
    title: 'Hasta 20,000 millas',
    description: 'de bienvenida con tu<br>tarjeta de crédito',
    image: {
      src: '//static.avianca.com/media/wy3dzyx0/thumbnail_cob_generica.png',
      altText: 'Beneficio de tarjeta de crédito',
    },
    customStyles: { '--group-options-item-color': 'var(--c-text)' },
    buttonText: 'Aplica ya',
    link: {
      url: 'https://www.avianca.com/co/es/experiencia/tarjetas-de-credito/',
      target: LinkTarget.BLANK,
    },
  },
];

const IMAGE_FULLCOVER_OPTIONS_NO_BUTTON: GroupOptionElementData[] = [
  {
    title: 'Gana 1,000 millas',
    description: 'creando tu cuenta Lifemiles<br>y comprando en avianca.com',
    image: {
      src: 'https://static.avianca.com/media/js1flo1g/card-lifemiles-v6.jpg',
      altText: 'Campaña gana millas',
    },
    link: {
      url: 'https://www.avianca.com/co/es/lifemiles/',
      target: LinkTarget.BLANK,
    },
  },
  {
    title: '¡Dona tus millas!',
    description: 'Transformemos vidas y<br>ecosistemas una milla a la vez.',
    image: {
      src: 'https://static.avianca.com/media/jjhn12xl/dona-millas-v5.jpg',
      altText: 'Suscripción a Lifemiles plus',
    },
    link: {
      url: 'https://www.lifemiles.com/',
      target: LinkTarget.BLANK,
    },
  },
  {
    title: 'Hasta 20,000 millas',
    description: 'de bienvenida con tu<br>tarjeta de crédito',
    image: {
      src: '//static.avianca.com/media/wy3dzyx0/thumbnail_cob_generica.png',
      altText: 'Beneficio de tarjeta de crédito',
    },
    customStyles: { '--group-options-item-color': 'var(--c-text)' },
    link: {
      url: 'https://www.avianca.com/co/es/experiencia/tarjetas-de-credito/',
      target: LinkTarget.BLANK,
    },
  },
];

// Template Style constants
const templateStyle = GroupOptionsTemplateStyles;

export const HORIZONTAL: Story = {
  name: 'Style - Horizontal',
  render: () => ({
    template: `
      <div style="margin-bottom: 24px">
        <h1 style="margin: 0 0 8px 0; font-size: 24px; font-weight: 700;">Horizontal Style</h1>
        <p>All examples with Enabled Horizontal Scroll: true</p>
      </div>
      <div style="display: flex; flex-direction: column; gap: 48px; padding-bottom: 64px;">
        <!-- Use of SvgImage Section -->
        <div>
          <div style="margin: 0 0 8px 0; font-size: 18px; font-weight: 600;">Clickable Cards (and use of svg images)</div>
          <p style="margin: 0 0 24px 0; color: #666; font-size: 14px;">Horizontal style with SVG icons - Column 3 / Scroll Enabled (default)</p>
          <ds-group-options
            [templateStyle]="templateStyle.HORIZONTAL"
            [templateGrid]="'3'"
            [enableHorizontalScroll]="true"
            [optionList]="svgOptions" />
        </div>

        <!-- Use of SvgImage / None Clickable Cards Section -->
        <div>
          <div style="margin: 0 0 8px 0; font-size: 18px; font-weight: 600;">None Clickable Cards (and use of svg images)</div>
          <p style="margin: 0 0 24px 0; color: #666; font-size: 14px;">Horizontal style with SVG icons - Cards without click behavior, using inline links in content</p>
          <ds-group-options
            [templateStyle]="templateStyle.HORIZONTAL"
            [templateGrid]="'3'"
            [enableHorizontalScroll]="true"
            [optionList]="svgOptionsNonClickable" />
        </div>

        <!-- Cards with Button Section -->
        <div>
          <div style="margin: 0 0 8px 0; font-size: 18px; font-weight: 600;">Cards with Button</div>
          <p style="margin: 0 0 24px 0; color: #666; font-size: 14px;">Horizontal style with SVG icons - All cards include a call-to-action button</p>
          <ds-group-options
            [templateStyle]="templateStyle.HORIZONTAL"
            [templateGrid]="'3'"
            [enableHorizontalScroll]="true"
            [optionList]="svgOptionsWithButton" />
        </div>

        <!-- Use of JpgImage Section -->
        <div>
          <div style="margin: 0 0 8px 0; font-size: 18px; font-weight: 600;">Clickable Cards (and use of jpg images)</div>
          <p style="margin: 0 0 24px 0; color: #666; font-size: 14px;">Horizontal style with full-width banner images - Column 3 / Scroll Enabled (default)</p>

          <div style="margin: 24px 0 8px 0; font-size: 14px; font-weight: 600;">Image edge aligned: false (default)</div>
          <p style="margin: 0 0 16px 0; color: #666; font-size: 13px;">Images respect card padding</p>
          <ds-group-options
            [templateStyle]="templateStyle.HORIZONTAL"
            [templateGrid]="'3'"
            [enableHorizontalScroll]="true"
            [optionList]="jpgOptionsDefault" />

          <div style="margin: 24px 0 8px 0; font-size: 14px; font-weight: 600;">Image edge aligned: true</div>
          <p style="margin: 0 0 16px 0; color: #666; font-size: 13px;">Images extend to card edges</p>
          <ds-group-options
            [templateStyle]="templateStyle.HORIZONTAL"
            [templateGrid]="'3'"
            [enableHorizontalScroll]="true"
            [optionList]="jpgOptionsEdgeAligned" />
        </div>

      </div>
    `,
    props: {
      templateStyle: templateStyle,
      svgOptions: SVG_OPTIONS,
      svgOptionsNonClickable: SVG_OPTIONS_NON_CLICKABLE,
      svgOptionsWithButton: SVG_OPTIONS_WITH_BUTTON,
      jpgOptionsDefault: JPG_OPTIONS_DEFAULT,
      jpgOptionsEdgeAligned: JPG_OPTIONS_EDGE_ALIGNED,
    },
  }),
  play: async ({ canvasElement }) => {
    const components = canvasElement.querySelectorAll('.group-options');

    await expect(components.length).toBe(5);
  },
};

export const VERTICAL: Story = {
  name: 'Style - Vertical',
  render: () => ({
    template: `
      <h1 style="margin: 0 0 24px 0; font-size: 24px; font-weight: 700;">Vertical Style</h1>
      <div style="display: flex; flex-direction: column; gap: 48px; padding-bottom: 64px;">
        <!-- Use of SvgImage Section -->
        <div>
          <div style="margin: 0 0 8px 0; font-size: 18px; font-weight: 600;">Clickable Cards (and use of svg images)</div>
          <p style="margin: 0 0 24px 0; color: #666; font-size: 14px;">Vertical style with SVG icons - Column 3 / Scroll Enabled (default)</p>
          <ds-group-options
            [templateStyle]="templateStyle.VERTICAL"
            [templateGrid]="'3'"
            [enableHorizontalScroll]="true"
            [optionList]="svgOptions" />
        </div>

        <!-- Use of SvgImage / None Clickable Cards Section -->
        <div>
          <div style="margin: 0 0 8px 0; font-size: 18px; font-weight: 600;">Use of Svg Image / None Clickable CardNone Clickable Cards (and use of svg images)</div>
          <p style="margin: 0 0 24px 0; color: #666; font-size: 14px;">Vertical style with SVG icons - Cards without click behavior, using inline links in content</p>
          <ds-group-options
            [templateStyle]="templateStyle.VERTICAL"
            [templateGrid]="'3'"
            [enableHorizontalScroll]="true"
            [optionList]="svgOptionsNonClickable" />
        </div>

        <!-- Cards with Button Section -->
        <div>
          <div style="margin: 0 0 8px 0; font-size: 18px; font-weight: 600;">Cards with Button</div>
          <p style="margin: 0 0 24px 0; color: #666; font-size: 14px;">Vertical style with SVG icons - All cards include a call-to-action button</p>
          <ds-group-options
            [templateStyle]="templateStyle.VERTICAL"
            [templateGrid]="'3'"
            [enableHorizontalScroll]="true"
            [optionList]="svgOptionsWithButton" />
        </div>

        <!-- Use of JpgImage Section -->
        <div>
          <div style="margin: 0 0 8px 0; font-size: 18px; font-weight: 600;">Clickable Cards (and use of jpg images)</div>
          <p style="margin: 0 0 24px 0; color: #666; font-size: 14px;">Vertical style with full-width banner images - Column 3 / Scroll Enabled (default)</p>

          <h4 style="margin: 24px 0 8px 0; font-size: 14px; font-weight: 600;">Image edge aligned: false (default)</h4>
          <p style="margin: 0 0 16px 0; color: #666; font-size: 13px;">Images respect card padding</p>
          <ds-group-options
            [templateStyle]="templateStyle.VERTICAL"
            [templateGrid]="'3'"
            [enableHorizontalScroll]="true"
            [optionList]="jpgOptionsDefault" />

          <h4 style="margin: 24px 0 8px 0; font-size: 14px; font-weight: 600;">Image edge aligned: true</h4>
          <p style="margin: 0 0 16px 0; color: #666; font-size: 13px;">Images extend to card edges</p>
          <ds-group-options
            [templateStyle]="templateStyle.VERTICAL"
            [templateGrid]="'3'"
            [enableHorizontalScroll]="true"
            [optionList]="jpgOptionsEdgeAligned" />
        </div>

      </div>
    `,
    props: {
      templateStyle: templateStyle,
      svgOptions: SVG_OPTIONS,
      svgOptionsNonClickable: SVG_OPTIONS_NON_CLICKABLE,
      svgOptionsWithButton: SVG_OPTIONS_WITH_BUTTON,
      jpgOptionsDefault: JPG_OPTIONS_DEFAULT,
      jpgOptionsEdgeAligned: JPG_OPTIONS_EDGE_ALIGNED,
    },
  }),
  play: async ({ canvasElement }) => {
    const components = canvasElement.querySelectorAll('.group-options');

    await expect(components.length).toBe(5);
  },
};

export const GRID: Story = {
  name: 'Grid Configurations',
  render: () => ({
    template: `
      <div style="display: flex; flex-direction: column; gap: 48px; padding-bottom: 64px;">
        <!-- 2 Columns Section -->
        <div>
          <div style="margin: 0 0 8px 0; font-size: 18px; font-weight: 600;">Column 2 / Scroll Enabled (default)</div>
          <p style="margin: 0 0 24px 0; color: #666; font-size: 14px;">Wider cards with 2-column grid layout</p>
          <ds-group-options
            [templateStyle]="templateStyle.HORIZONTAL"
            [templateGrid]="'2'"
            [enableHorizontalScroll]="true"
            [optionList]="options2Items" />
        </div>

        <!-- 3 Columns Section -->
        <div>
          <div style="margin: 0 0 8px 0; font-size: 18px; font-weight: 600;">Column 3 / Scroll Enabled (default)</div>
          <p style="margin: 0 0 24px 0; color: #666; font-size: 14px;">Balanced layout with 3-column grid (recommended)</p>
          <ds-group-options
            [templateStyle]="templateStyle.HORIZONTAL"
            [templateGrid]="'3'"
            [enableHorizontalScroll]="true"
            [optionList]="options" />
        </div>

        <!-- 4 Columns Section -->
        <div>
          <div style="margin: 0 0 8px 0; font-size: 18px; font-weight: 600;">Column 4 / Scroll Enabled (default)</div>
          <p style="margin: 0 0 24px 0; color: #666; font-size: 14px;">Compact layout with 4-column grid</p>
          <ds-group-options
            [templateStyle]="templateStyle.HORIZONTAL"
            [templateGrid]="'4'"
            [enableHorizontalScroll]="true"
            [optionList]="options4Items" />
        </div>
      </div>
    `,
    props: {
      templateStyle: templateStyle,
      options2Items: SVG_OPTIONS_2_ITEMS,
      options: SVG_OPTIONS,
      options4Items: SVG_OPTIONS_4_ITEMS,
    },
  }),
  play: async ({ canvasElement }) => {
    const components = canvasElement.querySelectorAll('.group-options');

    await expect(components.length).toBe(2);
  },
};

export const SCROLLABLE: Story = {
  name: 'Scrollable Behavior',
  render: () => ({
    template: `
      <div style="display: flex; flex-direction: column; gap: 48px; padding-bottom: 64px;">
        <!-- Scroll Enabled Section -->
        <div>
          <div style="margin: 0 0 8px 0; font-size: 18px; font-weight: 600;">Column 3 / Scroll Enabled (default)</div>
          <p style="margin: 0 0 24px 0; color: #666; font-size: 14px;">Items scroll horizontally when content exceeds container width</p>
          <ds-group-options
            [templateStyle]="templateStyle.HORIZONTAL"
            [templateGrid]="'3'"
            [enableHorizontalScroll]="true"
            [optionList]="options" />
        </div>

        <!-- Scroll Disabled Section -->
        <div>
          <div style="margin: 0 0 8px 0; font-size: 18px; font-weight: 600;">Column 3 / Scroll Disabled</div>
          <p style="margin: 0 0 24px 0; color: #666; font-size: 14px;">Items wrap to multiple rows instead of scrolling</p>
          <ds-group-options
            [templateStyle]="templateStyle.HORIZONTAL"
            [templateGrid]="'3'"
            [enableHorizontalScroll]="false"
            [optionList]="options" />
        </div>
      </div>
    `,
    props: {
      templateStyle: templateStyle,
      options: SVG_OPTIONS,
    },
  }),
  play: async ({ canvasElement }) => {
    const components = canvasElement.querySelectorAll('.group-options');

    await expect(components.length).toBe(2);
  },
};

export const HORIZONTAL_COMPACT: Story = {
  name: 'Style - Horizontal Compact',
  render: () => ({
    template: `
      <div style="margin-bottom: 24px">
        <h1 style="margin: 0 0 8px 0; font-size: 24px; font-weight: 700;">Horizontal Compact Style</h1>
        <p>Compact layout with 2 columns and no horizontal scroll</p>
      </div>
      <div style="display: flex; flex-direction: column; gap: 48px; padding-bottom: 64px;">
        <!-- Horizontal Compact Section -->
        <div>
          <p style="margin: 0 0 8px 0; color: #666; font-size: 14px;">Horizontal compact style - Column 2 / Scroll Disabled</p>
          <p style="margin: 0 0 24px 0; color: #666; font-size: 14px;">Primarily used in <strong>Web Check-in Manage</strong> for quick access to key booking modification options</p>
          <ds-group-options
            [templateStyle]="templateStyle.HORIZONTAL_COMPACT"
            [templateGrid]="'2'"
            [enableHorizontalScroll]="false"
            [optionList]="compactOptions" />
        </div>

      </div>
    `,
    props: {
      templateStyle: templateStyle,
      compactOptions: COMPACT_OPTIONS,
    },
  }),
  play: async ({ canvasElement }) => {
    const components = canvasElement.querySelectorAll('.group-options');

    await expect(components.length).toBe(1);
  },
};

export const COVER_IMAGE: Story = {
  name: 'Style - Cover Image',
  render: () => ({
    template: `
      <div style="margin-bottom: 24px">
        <h1 style="margin: 0 0 8px 0; font-size: 24px; font-weight: 700;">Cover Image Style</h1>
        <p>Full-bleed image cards with a promotional layout. The button style is automatically set to <strong>Secondary</strong>.</p>
      </div>
      <div style="display: flex; flex-direction: column; gap: 48px; padding-bottom: 64px;">

        <!-- Cards with Button Section -->
        <div>
          <div style="margin: 0 0 8px 0; font-size: 18px; font-weight: 600;">Cards with Button</div>
          <p style="margin: 0 0 24px 0; color: #666; font-size: 14px;">Cover image style — button style is derived as <code>Secondary</code> from <code>templateStyle</code></p>
          <ds-group-options
            [templateStyle]="templateStyle.COVER_IMAGE"
            [templateGrid]="'3'"
            [enableHorizontalScroll]="true"
            [optionList]="imageFullCoverOptions" />
        </div>

        <!-- Cards without Button Section -->
        <div>
          <div style="margin: 0 0 8px 0; font-size: 18px; font-weight: 600;">Cards without Button (Clickable)</div>
          <p style="margin: 0 0 24px 0; color: #666; font-size: 14px;">Cover image style — full card is the clickable area, no explicit button</p>
          <ds-group-options
            [templateStyle]="templateStyle.COVER_IMAGE"
            [templateGrid]="'3'"
            [enableHorizontalScroll]="true"
            [optionList]="imageFullCoverOptionsNoButton" />
        </div>

      </div>
    `,
    props: {
      templateStyle: templateStyle,
      imageFullCoverOptions: IMAGE_FULLCOVER_OPTIONS,
      imageFullCoverOptionsNoButton: IMAGE_FULLCOVER_OPTIONS_NO_BUTTON,
    },
  }),
  play: async ({ canvasElement }) => {
    const components = canvasElement.querySelectorAll('.group-options');

    await expect(components.length).toBe(3);
  },
};
