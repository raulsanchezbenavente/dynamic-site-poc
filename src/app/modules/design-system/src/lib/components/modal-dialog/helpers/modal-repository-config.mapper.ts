import { ButtonStyles, LayoutSize, ModalDialogActionType, ModalDialogTemplateModel } from '@dcx/ui/libs';

import { ModalDialogSize } from '../enums/modal-dialog-size.enum';
import { ModalDialogConfig } from '../models/modal-dialog.config';

function isValidModalDialogActionType(value?: string): value is ModalDialogActionType {
  if (!value) return false;
  return Object.values(ModalDialogActionType).includes(value as ModalDialogActionType);
}

export function mapModalRepositoryConfigToModalDialogConfig(
  repositoryTemplate?: ModalDialogTemplateModel
): ModalDialogConfig {
  const actionButtonControl = repositoryTemplate?.modalDialogButtonsControl?.actionButtonControl;
  const secondaryButtonControl = repositoryTemplate?.modalDialogButtonsControl?.secondaryButtonControl;

  return {
    title: repositoryTemplate?.modalDialogContent?.modalTitle || '',
    introText: repositoryTemplate?.modalDialogContent?.modalDescription || '',
    titleImageSrc: repositoryTemplate?.modalDialogContent?.modalImageSrc,
    footerButtonsConfig: {
      isVisible: true,
      actionButton: isValidModalDialogActionType(actionButtonControl)
        ? {
            label: repositoryTemplate?.modalDialogButtonsControl?.actionButtonLabel || '',
            layout: {
              size: LayoutSize.MEDIUM,
              style: ButtonStyles.ACTION,
            },
          }
        : undefined,
      secondaryButton: isValidModalDialogActionType(secondaryButtonControl)
        ? {
            label: repositoryTemplate?.modalDialogButtonsControl?.secondaryButtonLabel || '',
            link: {
              url: repositoryTemplate?.modalDialogButtonsControl?.secondaryButtonLink || '',
            },
            layout: {
              size: LayoutSize.MEDIUM,
              style: ButtonStyles.LINK,
            },
          }
        : undefined,
    },
    layoutConfig: {
      size: ModalDialogSize.SMALL,
    },
  };
}
