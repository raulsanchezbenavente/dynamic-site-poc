import type { ModalDialogConfig } from '@dcx/storybook/design-system';
import { ModalDialogComponent, ModalDialogSize, ModalFooterContentDirective } from '@dcx/storybook/design-system';
import type { IconConfig } from '@dcx/ui/libs';
import { ButtonStyles } from '@dcx/ui/libs';
import { NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { STORYBOOK_PROVIDERS } from '../../../../stories/providers/storybook.providers';

import {
  StorybookDialogWrapperComponent,
  StorybookServicesFooterDemoComponent,
} from './components/storybook-modal-dialog.components';
const META: Meta<ModalDialogComponent> = {
  title: 'Atoms/ModalDialog',
  component: ModalDialogComponent,
  tags: ['autodocs'],
  render: (args) => ({
    props: args,
    template: `
      <storybook-dialog-wrapper [config]="config" [customComponent]="customComponent" />
    `,
  }),
  parameters: {
    i18nModules: ['Common'],
    i18n: {
      api: true,
      mock: {},
    },
  },
  decorators: [
    moduleMetadata({
      imports: [
        NgbModalModule,
        ModalDialogComponent,
        StorybookDialogWrapperComponent,
        StorybookServicesFooterDemoComponent,
        ModalFooterContentDirective,
      ],
      providers: STORYBOOK_PROVIDERS,
    }),
  ],
};

export default META;
type Story = StoryObj<StorybookDialogWrapperComponent>;

export const DEFAULT: Story = {
  name: 'Modal Max Scenario',
  args: {
    config: {
      title: 'Baggage not included',
      introText: 'Are you sure you want to travel without luggage? Stay on this page and confirm your selection.',
      titleImageSrc: 'https://static.avianca.com/media/1004/hand-baggage.svg',
    } as ModalDialogConfig,
  },
};

export const WITH_ICON_NO_IMAGE: Story = {
  name: 'Only icon (no Image)',
  args: {
    config: {
      title: 'Baggage not included',
      introText: 'Are you sure you want to travel without luggage? Stay on this page and confirm your selection.',
      icon: { name: 'info-circle-filled' } as IconConfig,
    } as ModalDialogConfig,
  },
};

export const ONLY_ACTION_BUTTON: Story = {
  name: 'Only action button ',
  args: {
    config: {
      title: 'Baggage not included',
      introText: 'Are you sure you want to travel without luggage? Stay on this page and confirm your selection.',
      titleImageSrc: 'https://static.avianca.com/media/1004/hand-baggage.svg',
      layoutConfig: {
        size: ModalDialogSize.SMALL,
      },
      footerButtonsConfig: {
        isVisible: true,
        actionButton: {
          label: 'See more services',
          layout: {
            style: ButtonStyles.ACTION,
          },
        },
      },
    } as ModalDialogConfig,
  },
};

export const SIZE_SMALL_DEFAULT: Story = {
  name: 'Size Small (default)',
  args: {
    config: {
      title: 'Baggage not included',
      introText: 'Are you sure you want to travel without luggage? Stay on this page and confirm your selection.',
      titleImageSrc: 'https://static.avianca.com/media/1004/hand-baggage.svg',
      programmaticOpen: true,
    } as ModalDialogConfig,
  },
};
export const SIZE_MEDIUM: Story = {
  name: 'Size Medium',
  args: {
    config: {
      title: 'Baggage not included',
      introText: 'Are you sure you want to travel without luggage? Stay on this page and confirm your selection.',
      titleImageSrc: 'https://static.avianca.com/media/1004/hand-baggage.svg',
      layoutConfig: {
        size: ModalDialogSize.MEDIUM,
      },
    } as ModalDialogConfig,
  },
};
export const SIZE_MEDIUM_NOT_CENTERED: Story = {
  name: 'Size Medium Not Centered',
  args: {
    config: {
      title: 'Baggage not included',
      introText: 'Are you sure you want to travel without luggage? Stay on this page and confirm your selection.',
      layoutConfig: {
        centered: false,
        size: ModalDialogSize.MEDIUM,
      },
    } as ModalDialogConfig,
  },
};

export const SIZE_LARGE: Story = {
  name: 'Size Large',
  args: {
    config: {
      title: 'Baggage not included',
      introText: 'Are you sure you want to travel without luggage? Stay on this page and confirm your selection.',
      titleImageSrc: 'https://static.avianca.com/media/1004/hand-baggage.svg',
      centered: false,
      layoutConfig: {
        size: ModalDialogSize.LARGE,
      },
      footerButtonsConfig: {
        isVisible: false,
      },
    } as ModalDialogConfig,
  },
};
export const FULLSCREEN: Story = {
  name: 'Fullscreen',
  args: {
    config: {
      title: 'Baggage not included',
      introText: 'Are you sure you want to travel without luggage? Stay on this page and confirm your selection.',
      titleImageSrc: 'https://static.avianca.com/media/1004/hand-baggage.svg',
      layoutConfig: {
        fullscreen: true,
      },
    } as ModalDialogConfig,
  },
};

export const WITH_CUSTOM_FOOTER: Story = {
  name: 'With Custom Footer Content',
  render: (args) => ({
    props: args,
    template: `
      <storybook-large-size-footer-content [modalDialogConfig]="config" />
    `,
  }),
  args: {
    config: {
      title: 'Custom Footer Example',
      introText:
        'This large modal showcases how the modalFooterContent slot can host custom summary content, similar to the services-v1 experience.',
      footerButtonsConfig: {
        isVisible: false,
      },
    } as ModalDialogConfig,
  },
};
