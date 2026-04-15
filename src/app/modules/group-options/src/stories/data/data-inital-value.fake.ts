import { GroupOptionsTemplateStyles, TitleHeading } from '@dcx/ui/design-system';
import { LinkTarget } from '@dcx/ui/libs';

import type { GroupOptionsConfig } from '../../lib/models/group-options-config.model';

const GROUP_OPTIONS = [
  {
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
  },
  {
    title: 'Online Check-in',
    description: 'Get your boarding pass and save time at the airport.',
    image: {
      src: '//static.avianca.com/media/1240/check-in.svg',
      altText: 'Check-in icon',
    },
    link: {
      url: 'https://www.avianca.com/check-in',
    },
  },
  {
    title: 'Check-in online',
    description: 'Obtén tu pase de abordar y ahorra tiempo en el aeropuerto.',
    image: {
      src: '//static.avianca.com/media/1240/check-in.svg',
    },
  },
  {
    title: ' Requisitos para viajar ',
    description: 'Infórmate acerca de visas, vacunas y demás documentos.',
    image: {
      src: '//static.avianca.com/media/1204/requisitos-para-viajar.svg',
    },
  },
  {
    title: ' Requisitos para viajar ',
    description: 'Infórmate acerca de visas, vacunas y demás documentos.',
    image: {
      src: '//static.avianca.com/media/1055/informacionn-sobre-documentos-requisitos-viajar.webp',
    },
    imageEdgeAligned: true,
  },
  {
    title: ' Requisitos para viajar ',
    description: 'Infórmate acerca de visas, vacunas y demás documentos.',
    image: {
      src: '//static.avianca.com/media/1055/informacionn-sobre-documentos-requisitos-viajar.webp',
    },
    imageEdgeAligned: true,
    link: {
      url: 'https://www.google.com',
    },
  },
];

export const DATA_INITIAL_VALUE: GroupOptionsConfig = {
  culture: 'es',
  groupOptionsModel: {
    headingHorizAlignment: 'left',
    titleHeadingTag: TitleHeading.H2,
    titleHeadingStyle: TitleHeading.H1,
    titleText: 'Gestiona tu reserva',
    introText: 'Example of an introduction text for the group options component.',
    visuallyHiddenTitle: true,
    templateStyle: GroupOptionsTemplateStyles.HORIZONTAL,
    templateGrid: '3',
    enableHorizontalScroll: false,
    optionItemModels: GROUP_OPTIONS,
    waitForAvailableOptions: false,
  },
};
