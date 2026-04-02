import { EnumVerticalAlign, HorizontalAlign, LayoutSize, LinkTarget, SectionColors } from '@dcx/ui/libs';
import { VideoSourceOption } from '@dcx/ui/libs';

import { BannerAnimationEffect, BannerItemStyle, BannerType } from '../../enums';
import type { BannerContainerConfigParams, BannerItemConfig } from '../../models';

const UN_PUBLISH_DATE = new Date();
UN_PUBLISH_DATE.setDate(new Date().getDate() + 1);
const PUBLISH_DATE = new Date();
PUBLISH_DATE.setDate(new Date().getDate() - 1);

export const BANNER_ANIMATION_CURRENCY = {
  animation: {
    cycleTime: 6000,
    effect: BannerAnimationEffect.FADING,
  },
  currency: 'COP',
};

// default content for Default and AsideBox Styles
export const BANNER_ITEM_DEFAULT: BannerItemConfig = {
  configuration: {
    enableLowestPrice: true,
    isFullAreaClickable: false,
    showButton: true,
    link: {
      title: 'Compra ya',
      url: '#',
    },
  },
  content: {
    bannerType: BannerType.GENERIC,
    // headingLevel: TitleHeading.H1,
    title: '<small>¡más cielos para volar, </small>más destinos!',
    subtitle: 'Reserva ya tu vuelo y viaja entre marzo y noviembre de 2025.',
    footnote:
      '* Travel from 22 August to 30 September. See the <a href="https://www.google.com">terms and conditions</a>',
    lowestPrice: {
      USD: 2400,
      eur: 2400,
      cop: 2400,
    },
  },
  layout: {
    bannerStyle: BannerItemStyle.DEFAULT,
    horizontalAlign: HorizontalAlign.LEFT,
    verticalAlign: EnumVerticalAlign.MIDDLE,
    fontSize: LayoutSize.MEDIUM,
  },
  media: {
    imageMedia: {
      bg: {
        title: 'Image title 1',
        url: 'https://static.avianca.com/media/w3hatpch/vuelos_avianca_playa.jpg',
      },
      bgM: {
        title: 'Image title 1',
        url: 'https://static.avianca.com/media/w3hatpch/vuelos_avianca_playa.jpg',
      },
      bgL: {
        title: 'Image title 1',
        url: 'https://static.avianca.com/media/w3hatpch/vuelos_avianca_playa.jpg',
      },
      text: 'Test slider 1',
    },
  },
  tags: [],
};
export const BANNER_ITEM_ASIDE: BannerItemConfig = {
  ...BANNER_ITEM_DEFAULT,
  configuration: {
    ...BANNER_ITEM_DEFAULT.configuration,
    link: {
      title: 'Compra ya',
      url: '#',
    },
  },
  content: {
    ...BANNER_ITEM_DEFAULT.content,
    title: '<small>¡más cielos para volar, </small>más destinos!',
    subtitle: 'Reserva ya tu vuelo y viaja entre marzo y noviembre de 2025.',
  },
  layout: {
    ...BANNER_ITEM_DEFAULT.layout,
    bannerStyle: BannerItemStyle.ASIDE_BOX,
  },
  media: {
    imageMedia: {
      bg: {
        title: 'Image title 1',
        url: 'https://static.avianca.com/media/w3hatpch/vuelos_avianca_playa.jpg',
      },
      bgM: {
        title: 'Image title 1',
        url: 'https://static.avianca.com/media/w3hatpch/vuelos_avianca_playa.jpg',
      },
      bgL: {
        title: 'Image title 1',
        url: 'https://static.avianca.com/media/w3hatpch/vuelos_avianca_playa.jpg',
      },
      text: 'Test slider 1',
    },
  },
};

// Sections (colors) banners content
export const BANNER_ITEM_SECTION: BannerItemConfig = {
  ...BANNER_ITEM_ASIDE,
  configuration: {
    ...BANNER_ITEM_ASIDE.configuration,
    enableLowestPrice: false,
    showButton: false,
  },
  content: {
    ...BANNER_ITEM_ASIDE.content,
    title: '<small>requisitos</small>para viajar',
    subtitle: 'Infórmate acerca de visas, vacunas y demás<br>documentos para entrar a tu destino.',
    footnote: '',
  },
};

// Promotion banners images and content
export const BANNER_ITEM_PROMO_DESTINATIONS: BannerItemConfig = {
  ...BANNER_ITEM_DEFAULT,
  configuration: {
    ...BANNER_ITEM_DEFAULT.configuration,
    enableLowestPrice: false,
    showButton: false,
    link: {
      title: 'Conoce más',
      url: 'https://flight-deals.lifemiles.com/es/?utm_source=DIGITAL&amp;utm_campaign=RDN_MR_MR_LT_FEB25',
      target: LinkTarget.BLANK,
    },
  },
  content: {
    ...BANNER_ITEM_DEFAULT.content,
    title: '<small>el destino ideal</small> te está esperando.',
    subtitle: 'Aventura o relax,  lo elegimos juntos.',
    footnote: '',
  },
  layout: {
    ...BANNER_ITEM_DEFAULT.layout,
    verticalAlign: EnumVerticalAlign.TOP,
  },
  media: {
    imageMedia: {
      bg: {
        title: 'Image title 1',
        url: 'https://static.avianca.com/media/akrnymae/s_tiquetes_baratos_sanvalentin.jpg',
      },
      bgM: {
        title: 'Image title 1',
        url: 'https://static.avianca.com/media/ngabeekd/m_tiquetes_baratos_sanvalentin.jpg',
      },
      bgL: {
        title: 'Image title 1',
        url: 'https://static.avianca.com/media/wqghko0q/l_tiquetes_baratos_sanvalentin.jpg',
      },
      text: 'Test slider 1',
    },
  },
};
export const BANNER_ITEM_DESTINATIONS: BannerItemConfig = {
  ...BANNER_ITEM_DEFAULT,
  configuration: {
    ...BANNER_ITEM_DEFAULT.configuration,
    enableLowestPrice: false,
    showButton: false,
  },
  content: {
    ...BANNER_ITEM_DEFAULT.content,
    title: 'Destinos',
    subtitle: 'encuentra el tuyo y viaja',
    footnote: '',
  },
  layout: {
    bannerStyle: BannerItemStyle.DEFAULT,
    horizontalAlign: HorizontalAlign.CENTER,
    verticalAlign: EnumVerticalAlign.TOP,
    fontSize: LayoutSize.LARGE,
  },
  media: {
    imageMedia: {
      bg: {
        title: 'Image title 1',
        url: 'https://static.avianca.com/media/1060/beach-desktop.jpg',
      },
      bgM: {
        title: 'Image title 1',
        url: 'https://static.avianca.com/media/1060/beach-desktop.jpg',
      },
      bgL: {
        title: 'Image title 1',
        url: 'https://static.avianca.com/media/1060/beach-desktop.jpg',
      },
      text: 'Test slider 1',
    },
  },
};

// Banner with Video
export const BANNER_ITEM_VIDEO: BannerItemConfig = {
  ...BANNER_ITEM_DEFAULT,
  configuration: {
    ...BANNER_ITEM_DEFAULT.configuration,
    enableLowestPrice: false,
    showButton: false,
  },
  layout: {
    ...BANNER_ITEM_DEFAULT.layout,
    horizontalAlign: HorizontalAlign.LEFT,
    verticalAlign: EnumVerticalAlign.MIDDLE,
  },
  media: {
    videoMedia: {
      sourceOption: VideoSourceOption.UPLOAD,
      text: 'Test slider 1',
      upload: {
        extension: 'mp4',
        height: '100%',
        width: '100%',
        autoplay: true,
        muted: false,
        controls: false,
        url: 'https://placehold.co/640x360?text=Video+Placeholder',
        loop: true,
      },
      fallbackImage: {
        bg: {
          title: 'Image title 1',
          url: 'https://placehold.co/640x360?text=Image+For+Video+Placeholder+Default',
        },
        bgM: {
          title: 'Image title 1',
          url: 'https://placehold.co/640x360?text=Image+For+Video+Placeholder+Medium+Screens',
        },
        bgL: {
          title: 'Image title 1',
          url: 'https://placehold.co/640x360?text=Image+For+Video+Placeholder+Large+Screens',
        },
        text: 'Test slider 1',
      },
    },
  },
};

// Banners Items
export const BANNER_ITEM_1: BannerItemConfig = {
  ...BANNER_ITEM_PROMO_DESTINATIONS,
};
export const BANNER_ITEM_2: BannerItemConfig = {
  ...BANNER_ITEM_PROMO_DESTINATIONS,
  configuration: {
    ...BANNER_ITEM_PROMO_DESTINATIONS.configuration,
    enableLowestPrice: true,
  },
};
export const BANNER_ITEM_3: BannerItemConfig = {
  ...BANNER_ITEM_DESTINATIONS,
};
export const BANNER_ITEM_4: BannerItemConfig = {
  ...BANNER_ITEM_DESTINATIONS,
  layout: {
    ...BANNER_ITEM_DESTINATIONS.layout,
    fontSize: LayoutSize.SMALL,
  },
};
export const BANNER_ITEM_5: BannerItemConfig = {
  ...BANNER_ITEM_VIDEO,
};
// aside box
export const BANNER_ITEM_6: BannerItemConfig = {
  ...BANNER_ITEM_ASIDE,
  configuration: {
    ...BANNER_ITEM_ASIDE.configuration,
    enableLowestPrice: false,
  },
};
export const BANNER_ITEM_7: BannerItemConfig = {
  ...BANNER_ITEM_SECTION,
  sectionColors: SectionColors.OFFER,
};
export const BANNER_ITEM_8: BannerItemConfig = {
  ...BANNER_ITEM_SECTION,
  sectionColors: SectionColors.INFO,
};
export const BANNER_ITEM_9: BannerItemConfig = {
  ...BANNER_ITEM_SECTION,
  sectionColors: SectionColors.BOOKING,
};

// Items by Style
export const BANNER_DEFAULT_ITEMS: BannerItemConfig[] = [
  {
    ...BANNER_ITEM_1,
  },
  {
    ...BANNER_ITEM_2,
  },
  {
    ...BANNER_ITEM_3,
  },
  {
    ...BANNER_ITEM_4,
  },
  {
    ...BANNER_ITEM_5,
  },
  {
    ...BANNER_ITEM_6,
  },
  {
    ...BANNER_ITEM_7,
  },
  {
    ...BANNER_ITEM_8,
  },
  {
    ...BANNER_ITEM_9,
  },
];
export const BANNER_ASIDEBOX_ITEMS: BannerItemConfig[] = [
  {
    ...BANNER_ITEM_6,
  },
  {
    ...BANNER_ITEM_7,
  },
  {
    ...BANNER_ITEM_8,
  },
  {
    ...BANNER_ITEM_9,
  },
];

export const DATA_INITIAL_VALUE: BannerContainerConfigParams = {
  banner: {
    ariaAttributes: {
      ariaControls: '',
      ariaLabel: '',
      ariaLabelledBy: '',
    },
    accessibilityConfig: {
      id: 'bannerId10',
    },
    rootNodeId: 17226,
    animationCycleTime: 1000000,
    animationEffect: BannerAnimationEffect.SLIDING,
    bannerTitle: 'Banner carousel accessbility title',
    culture: 'en-US',
    isFullWidth: false,
    isTouchSwipe: false,
    showControls: true,
    showPagination: true,
    bannerItems: BANNER_DEFAULT_ITEMS,
  },
  componentOrder: 0,
  culture: 'en-US',
  rootNodeId: 17226,
};

export const BANNER_ITEM_LIFEMILES_PAGE: BannerItemConfig = {
  ...BANNER_ITEM_DEFAULT,
  configuration: {
    ...BANNER_ITEM_DEFAULT.configuration,
    showButton: true,
    link: {
      title: 'Learn more',
      url: '#',
    },
  },
  content: {
    title: 'Enjoy the benefits of being LifeMiles+',
    subtitle:
      '<small>Between 10% and 25% automatic discount on redemptions <br> with avianca and 10% on redemptions with Star Alliance.</small>',
  },
  layout: {
    bannerStyle: BannerItemStyle.DEFAULT,
    horizontalAlign: HorizontalAlign.LEFT,
    verticalAlign: EnumVerticalAlign.MIDDLE,
    fontSize: LayoutSize.SMALL,
  },
  media: {
    imageMedia: {
      bg: {
        title: 'Image title 1',
        url: 'https://static.avianca.com/media/5t4dqktz/promo-card-blue-card-lifemiles.png',
      },
      bgM: {
        title: 'Image title 1',
        url: 'https://static.avianca.com/media/5t4dqktz/promo-card-blue-card-lifemiles.png',
      },
      bgL: {
        title: 'Image title 1',
        url: 'https://static.avianca.com/media/5t4dqktz/promo-card-blue-card-lifemiles.png',
      },
    },
  },
};

export const BANNER_ITEMS_ACCOUNT_SETTINGS_PAGE: BannerItemConfig = {
  ...BANNER_ITEM_DEFAULT,
  configuration: {
    ...BANNER_ITEM_LIFEMILES_PAGE.configuration,
    showButton: true,
    link: {
      title: 'Apple wallet',
      url: '#',
    },
    isFullAreaClickable: true,
  },
  content: {
    title: 'Add your Lifemiles status <br> to your wallet',
    subtitle: '<small>Keep your status at your fingertips.</small>',
  },
  layout: {
    bannerStyle: BannerItemStyle.DEFAULT,
    horizontalAlign: HorizontalAlign.LEFT,
    verticalAlign: EnumVerticalAlign.MIDDLE,
    fontSize: LayoutSize.SMALL,
  },
  media: {
    imageMedia: {
      bg: {
        title: 'Image title 1',
        url: 'https://static.avianca.com/media/wy3dzyx0/thumbnail_cob_generica.png',
      },
      bgM: {
        title: 'Image title 1',
        url: '',
      },
      bgL: {
        title: 'Image title 1',
        url: '',
      },
    },
  },
};
