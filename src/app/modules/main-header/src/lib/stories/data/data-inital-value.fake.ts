import type { BannerConfigParams } from '@dcx/ui/business-common';
import { BannerAnimationEffect, BannerItemStyle, BannerType, MenuType } from '@dcx/ui/business-common';
import {
  DropdownLayoutType,
  EnumVerticalAlign,
  HorizontalAlign,
  LayoutSize,
  LinkTarget,
  SectionColors,
} from '@dcx/ui/libs';

import { SecondaryNavComponents } from '../../components/secondary-nav/enums/secondary-nav-components.enum';
import type { MainHeaderConfig } from '../../models/main-header-config.interface';
import type { MainMenuItem } from '../../models/main-menu-item.model';

const UN_PUBLISH_DATE = new Date();
UN_PUBLISH_DATE.setDate(new Date().getDate() + 1);
const PUBLISH_DATE = new Date();
PUBLISH_DATE.setDate(new Date().getDate() - 1);

const CULTURE = 'en-US';

const BANNER_CONFIG: BannerConfigParams = {
  ariaAttributes: {},
  accessibilityConfig: {
    id: 'bannerId10',
  },
  rootNodeId: 17226,
  animationCycleTime: 4000,
  animationEffect: BannerAnimationEffect.SLIDING,
  bannerTitle: 'Banner carousel accessbility title',
  culture: CULTURE,
  isFullWidth: false,
  isTouchSwipe: false,
  showControls: true,
  showPagination: true,
  bannerItems: [
    {
      sectionColors: SectionColors.OFFER,
      configuration: {
        enableLowestPrice: false,
        isFullAreaClickable: true,
        showButton: false,
        link: {
          title: 'Compra ya',
          url: 'https://www.avianca.com',
        },
      },
      layout: {
        horizontalAlign: HorizontalAlign.LEFT,
        verticalAlign: EnumVerticalAlign.MIDDLE,
        fontSize: LayoutSize.MEDIUM,
        bannerStyle: BannerItemStyle.ASIDE_BOX,
      },
      media: {
        imageMedia: {
          bg: {
            title: 'Image title 1',
            url: '//static.avianca.com/media/2wchphmv/banner-es-nuevas-rutas-min.jpg',
          },
          text: 'Test slider 1',
        },
      },
      content: {
        bannerType: BannerType.GENERIC,
        title: '<small>Nuevas rutas,</small>más destinos por descubrir',
        subtitle: '',
        lowestPrice: {
          USD: 2400,
          eur: 2400,
          cop: 2400,
        },
      },
      tags: [],
    },
  ],
};

export const DATA_INITIAL_VALUE_MAINMENU: MainMenuItem[] = [
  // Nav Level 1 - direct link
  {
    id: 'abc',
    title: '',
    // icon: {
    //   name: 'flight-takeoff',
    // },
    link: {
      title: 'Reservar',
      url: 'https://www.google.com',
    },
    columns: [],
  },
  // Nav Level 1
  {
    title: 'Ofertas y destinos',
    sectionColor: SectionColors.OFFER,
    bannerConfig: BANNER_CONFIG,
    // Submenu
    columns: [
      {
        // Nav Level 2
        sections: [
          {
            link: {
              title: 'Ofertas de vuelos',
              url: '#',
            },
          },
          {
            link: {
              title: 'Destinos',
              url: '#',
            },
          },
          {
            link: {
              title: 'Nuevas rutas',
              url: '#',
            },
          },
          {
            link: {
              title: 'Reservas de grupos',
              url: '#',
              target: LinkTarget.BLANK,
            },
          },
          {
            link: {
              title: 'Reservas de hoteles',
              url: 'https://sp.booking.com/dealspage.html?aid=2434507&label=hotels_navtab',
              target: LinkTarget.BLANK,
            },
          },
          {
            link: {
              title: 'Alquiler de autos',
              url: 'https://www.rentalcars.com/?affiliateCode=avianca695&adplat=cardlandingpage',
              target: LinkTarget.BLANK,
            },
          },
          {
            link: {
              title: 'Tours y excursiones',
              url: 'https://avianca.civitatis.com/es/',
              target: LinkTarget.BLANK,
            },
          },
        ],
      },
    ],
  },
  // Nav Level 1
  {
    title: 'Tu reserva',
    sectionColor: SectionColors.BOOKING,
    // icon: {
    //   name: 'info-circle-outline',
    // },
    tag: 'Check-in',
    // Submenu
    columns: [
      {
        // Nav Level 2
        sections: [
          {
            // icon: {
            //   name: 'info-circle-outline',
            // },
            link: {
              title: 'Gestiona tu reserva',
              url: '#',
            },
          },
          {
            link: {
              title: 'Personaliza tu Viaje',
              url: '#',
            },
          },
          {
            link: {
              title: 'Check-in online',
              url: '#',
            },
          },
          {
            link: {
              title: 'Business class',
              url: '#',
            },
          },
          {
            link: {
              title: 'Cambios y reembolsos',
              url: '#',
            },
          },
          {
            link: {
              title: 'avianca credits',
              url: '#',
            },
          },
          {
            link: {
              title: 'Estados de vuelo',
              url: '#',
              target: LinkTarget.BLANK,
            },
          },
          {
            link: {
              title: 'Asistencia en viaje',
              url: '#',
              target: LinkTarget.BLANK,
            },
          },
          {
            link: {
              title: 'Ofertas con millas',
              url: '#',
            },
          },
        ],
      },
    ],
  },
  // Nav Level 1
  {
    title: 'Información y ayuda',
    sectionColor: SectionColors.INFO,
    // icon: {
    //   name: 'info-circle-outline',
    // },
    // Submenu
    columns: [
      {
        // Nav Level 2
        sections: [
          {
            link: {
              title: 'Tipos de tarifas',
              url: '#',
            },
          },
          {
            link: {
              title: 'Equipaje',
              url: '#',
            },
          },
          {
            link: {
              title: 'Experiencia avianca',
              url: '#',
            },
          },
        ],
      },
    ],
  },
  // Nav Level 1
  {
    title: 'Lifemiles',
    sectionColor: SectionColors.FARE_BUSINESS,
    bannerConfig: {
      ...BANNER_CONFIG,
      bannerItems: [
        {
          ...BANNER_CONFIG.bannerItems[0],
          sectionColors: SectionColors.FARE_BUSINESS,
          media: {
            imageMedia: {
              bg: {
                title: 'Image title 1',
                url: '//static.avianca.com/media/4kjahhnj/es-home-l-2x1-miles-business-menu-lm-v2-min.jpg',
              },
              text: 'Test slider 1',
            },
          },
          content: {
            bannerType: BannerType.GENERIC,
            title: '<small>Gana el doble, </small>en Business',
            subtitle: '',
            text: '¡Más millas que te acercan al estatus elite!',
            lowestPrice: {
              USD: 2400,
              eur: 2400,
              cop: 2400,
            },
          },
        },
      ],
    },
    // icon: {
    //   name: 'info-circle-outline',
    // },
    // Submenu
    columns: [
      {
        // Nav Level 2
        sections: [
          {
            link: {
              title: 'Programa lifemiles',
              url: '#',
            },
          },
          {
            link: {
              title: 'Millas pendientes',
              url: '#',
            },
          },
          {
            link: {
              title: 'club lifemiles',
              url: '#',
            },
          },
          {
            link: {
              title: 'Ganas millas volando',
              url: '#',
            },
          },
          {
            link: {
              title: 'Tarjetas de crédito',
              url: '#',
            },
          },
          {
            link: {
              title: 'Redime tus millas',
              url: '#',
            },
          },
          {
            link: {
              title: 'Ofertas con millas',
              url: '#',
            },
          },
        ],
      },
    ],
  },
];

export const DATA_INITIAL_VALUE_MAINMENU_MOBILE: MainMenuItem[] = DATA_INITIAL_VALUE_MAINMENU;

/** configurations */
export const DATA_INITIAL_VALUE: MainHeaderConfig = {
  culture: CULTURE,
  authData: {
    redirectUrlAfterLogin: {
      url: '/en/members/personal-data/',
      title: 'Personal Data',
    },
    redirectUrlAfterLogout: {
      url: '/en/home/',
      title: 'Home',
    },
    authenticatedAccountMenuConfig: {
      culture: CULTURE,
      options: [
        {
          link: {
            url: '/home',
            title: 'Home',
          },
        },
        {
          link: {
            url: '/en/members/my-lifemiles/',
            title: 'Auth.AuthenticatedAccountMenu.MyEliteStatus',
          },
        },
        {
          link: {
            url: '/en/members/my-trips/',
            title: 'Auth.AuthenticatedAccountMenu.MyTrips',
          },
        },
        {
          link: {
            url: '/en/members/my-profile/',
            title: 'Auth.AuthenticatedAccountMenu.MyProfile',
          },
        },
        {
          link: {
            url: 'https://google.com',
            title: 'Auth.AuthenticatedAccountMenu.BookWithMiles',
            target: LinkTarget.BLANK,
          },
        },
        {
          link: {
            url: '/en/members/my-preferences/',
            title: 'Auth.AuthenticatedAccountMenu.AccountSettings',
          },
        },
        {
          link: {
            url: '/en/members/home/',
            title: 'Auth.AuthenticatedAccountMenu.Logout',
          },
          type: MenuType.LOGOUT,
        },
      ],
    },
    dialogModalsRepository: {
      modalDialogExceptions: [],
    },
  },
  logo: {
    altText: 'logo',
    link: {
      url: 'https://www.avianca.com',
    },
    src: 'https://static.avianca.com/media/cr2j1dir/logoavianca-newbrand-rojo-1.svg',
  },
  logoMobile: {
    altText: 'logo',
    link: {
      url: 'https://www.avianca.com',
    },
    src: 'https://static.avianca.com/media/cr2j1dir/logoavianca-newbrand-rojo-1.svg',
  },
  mainMenuList: [...DATA_INITIAL_VALUE_MAINMENU],
  mainMenuListMobile: [...DATA_INITIAL_VALUE_MAINMENU_MOBILE],
  secondaryNavAvailableOptions: [
    SecondaryNavComponents.LANGUAGE_SELECTOR,
    SecondaryNavComponents.POINT_OF_SALE_SELECTOR,
  ],
  secondaryNavOptionsMobile: [SecondaryNavComponents.LANGUAGE_SELECTOR, SecondaryNavComponents.POINT_OF_SALE_SELECTOR],
  languageSelectorListConfig: {
    dropdownModel: {
      value: 'Español (ES)',
      config: {
        label: 'Language',
        icon: {
          name: 'language',
        },
        layoutConfig: {
          layout: DropdownLayoutType.DEFAULT,
        },
        closeOnSelection: true,
      },
    },
    optionsListConfig: {
      options: [
        {
          code: 'ru-RU',
          name: 'Русский',
        },
        {
          code: 'fr-FR',
          name: 'Française',
        },
        {
          code: 'es-CO',
          name: 'Español',
        },
        {
          code: 'de-DE',
          name: 'Deutsch',
        },
        {
          code: 'it-IT',
          name: 'Italiano',
        },
        {
          code: 'tr-TR',
          name: 'Türkçe',
        },
        {
          code: 'pt-BR',
          name: 'Português',
        },
        {
          code: 'kk-KZ',
          name: 'Ағылшын',
        },
        {
          code: 'el-GR',
          name: 'Ελληνική',
        },
        {
          code: CULTURE,
          isSelected: true,
          name: 'English',
        },
      ],
      ariaAttributes: {
        ariaLabel: 'Language options list',
      },
    },
  },
  showAuthButton: true,
  enableFixedHeaderOnScroll: true,
};
