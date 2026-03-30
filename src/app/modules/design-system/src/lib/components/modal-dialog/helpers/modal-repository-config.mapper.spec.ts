import { ButtonStyles, LayoutSize, ModalDialogActionType } from '@dcx/ui/libs';

import { ModalDialogSize } from '../enums/modal-dialog-size.enum';
import { ModalDialogTemplateModel } from '../models/modal-dialog-template-model.interface';
import { mapModalRepositoryConfigToModalDialogConfig } from './modal-repository-config.mapper';

// Test data builders (outside describe for cleaner code - Sonar S7721)
const createCompleteTemplate = (): ModalDialogTemplateModel => ({
  modalDialogContent: {
    modalTitle: 'Test Title',
    modalDescription: 'Test Description',
    modalImageSrc: 'test-image.jpg',
  },
  modalDialogButtonsControl: {
    actionButtonControl: 'confirm',
    actionButtonLabel: 'Confirm',
    secondaryButtonControl: 'cancel',
    secondaryButtonLabel: 'Cancel',
    secondaryButtonLink: '/cancel',
    showClose: true,
    showButtons: true,
  },
  modalDialogSettings: {
    modalDialogId: 'test-modal',
  },
});

const createEmptyTemplate = (): ModalDialogTemplateModel =>
  ({
    modalDialogContent: {},
    modalDialogButtonsControl: {},
    modalDialogSettings: {},
  }) as ModalDialogTemplateModel;

const createTemplateWithInvalidActionType = (actionType: string): ModalDialogTemplateModel =>
  ({
    modalDialogContent: { modalTitle: 'Test' },
    modalDialogButtonsControl: {
      actionButtonControl: actionType,
      actionButtonLabel: 'Test Label',
    },
  }) as ModalDialogTemplateModel;

describe('mapModalRepositoryConfigToModalDialogConfig', () => {
  describe('Happy Path - Complete Template', () => {
    it('should map complete repository template to modal dialog config', () => {
      const template = createCompleteTemplate();
      const result = mapModalRepositoryConfigToModalDialogConfig(template);

      expect(result.title).toBe('Test Title');
      expect(result.introText).toBe('Test Description');
      expect(result.titleImageSrc).toBe('test-image.jpg');
      expect(result.layoutConfig?.size).toBe(ModalDialogSize.SMALL);
      expect(result.footerButtonsConfig?.isVisible).toBe(true);
      expect(result.footerButtonsConfig?.actionButton?.label).toBe('Confirm');
      expect(result.footerButtonsConfig?.actionButton?.layout?.size).toBe(LayoutSize.MEDIUM);
      expect(result.footerButtonsConfig?.actionButton?.layout?.style).toBe(ButtonStyles.ACTION);
      expect(result.footerButtonsConfig?.secondaryButton?.label).toBe('Cancel');
      expect(result.footerButtonsConfig?.secondaryButton?.link?.url).toBe('/cancel');
      expect(result.footerButtonsConfig?.secondaryButton?.layout?.size).toBe(LayoutSize.MEDIUM);
      expect(result.footerButtonsConfig?.secondaryButton?.layout?.style).toBe(ButtonStyles.LINK);
    });

    it('should map template with only action button', () => {
      const template: ModalDialogTemplateModel = {
        modalDialogContent: { modalTitle: 'Only Action' },
        modalDialogButtonsControl: {
          actionButtonControl: 'confirm',
          actionButtonLabel: 'OK',
        },
      } as ModalDialogTemplateModel;
      const result = mapModalRepositoryConfigToModalDialogConfig(template);
      expect(result.footerButtonsConfig?.actionButton).toBeDefined();
      expect(result.footerButtonsConfig?.secondaryButton).toBeUndefined();
    });

    it('should map template with only secondary button', () => {
      const template: ModalDialogTemplateModel = {
        modalDialogContent: { modalTitle: 'Only Secondary' },
        modalDialogButtonsControl: {
          secondaryButtonControl: 'cancel',
          secondaryButtonLabel: 'Cancel',
          secondaryButtonLink: '/back',
        },
      } as ModalDialogTemplateModel;
      const result = mapModalRepositoryConfigToModalDialogConfig(template);
      expect(result.footerButtonsConfig?.actionButton).toBeUndefined();
      expect(result.footerButtonsConfig?.secondaryButton).toBeDefined();
      expect(result.footerButtonsConfig?.secondaryButton?.link?.url).toBe('/back');
    });
  });

  describe('Edge Cases - Undefined/Null/Empty Values', () => {
    it('should handle undefined template', () => {
      const result = mapModalRepositoryConfigToModalDialogConfig(undefined);
      expect(result.title).toBe('');
      expect(result.introText).toBe('');
      expect(result.titleImageSrc).toBeUndefined();
      expect(result.footerButtonsConfig?.actionButton).toBeUndefined();
      expect(result.footerButtonsConfig?.secondaryButton).toBeUndefined();
      expect(result.layoutConfig?.size).toBe(ModalDialogSize.SMALL);
    });

    it('should handle empty template', () => {
      const template = createEmptyTemplate();
      const result = mapModalRepositoryConfigToModalDialogConfig(template);
      expect(result.title).toBe('');
      expect(result.introText).toBe('');
      expect(result.titleImageSrc).toBeUndefined();
    });

    it('should handle null modalDialogContent', () => {
      const template = {
        modalDialogContent: null,
        modalDialogButtonsControl: { actionButtonControl: 'confirm' },
      } as unknown as ModalDialogTemplateModel;
      const result = mapModalRepositoryConfigToModalDialogConfig(template);
      expect(result.title).toBe('');
      expect(result.introText).toBe('');
      expect(result.titleImageSrc).toBeUndefined();
    });

    it('should handle null modalDialogButtonsControl', () => {
      const template = {
        modalDialogContent: { modalTitle: 'Title' },
        modalDialogButtonsControl: null,
      } as unknown as ModalDialogTemplateModel;
      const result = mapModalRepositoryConfigToModalDialogConfig(template);
      expect(result.footerButtonsConfig?.actionButton).toBeUndefined();
      expect(result.footerButtonsConfig?.secondaryButton).toBeUndefined();
    });

    it('should use empty string for missing labels', () => {
      const template: ModalDialogTemplateModel = {
        modalDialogContent: {},
        modalDialogButtonsControl: {
          actionButtonControl: 'confirm',
          secondaryButtonControl: 'cancel',
        },
      } as ModalDialogTemplateModel;
      const result = mapModalRepositoryConfigToModalDialogConfig(template);
      expect(result.footerButtonsConfig?.actionButton?.label).toBe('');
      expect(result.footerButtonsConfig?.secondaryButton?.label).toBe('');
      expect(result.footerButtonsConfig?.secondaryButton?.link?.url).toBe('');
    });

    it('should handle undefined nested properties', () => {
      const template = {
        modalDialogContent: {
          modalTitle: undefined,
          modalDescription: undefined,
        },
        modalDialogButtonsControl: {
          actionButtonControl: 'confirm',
          actionButtonLabel: undefined,
        },
      } as unknown as ModalDialogTemplateModel;
      const result = mapModalRepositoryConfigToModalDialogConfig(template);
      expect(result.title).toBe('');
      expect(result.introText).toBe('');
      expect(result.footerButtonsConfig?.actionButton?.label).toBe('');
    });
  });

  describe('Action Button Validation', () => {
    it('should not create action button when actionButtonControl is invalid string', () => {
      const template = createTemplateWithInvalidActionType('invalid-action');
      const result = mapModalRepositoryConfigToModalDialogConfig(template);
      expect(result.footerButtonsConfig?.actionButton).toBeUndefined();
    });

    it('should not create action button when actionButtonControl is empty string', () => {
      const template = createTemplateWithInvalidActionType('');
      const result = mapModalRepositoryConfigToModalDialogConfig(template);
      expect(result.footerButtonsConfig?.actionButton).toBeUndefined();
    });

    it('should not create action button when actionButtonControl is undefined', () => {
      const template: ModalDialogTemplateModel = {
        modalDialogContent: {},
        modalDialogButtonsControl: {
          actionButtonLabel: 'Test',
        },
      } as ModalDialogTemplateModel;
      const result = mapModalRepositoryConfigToModalDialogConfig(template);
      expect(result.footerButtonsConfig?.actionButton).toBeUndefined();
    });

    it('should create action button for all valid ModalDialogActionType values', () => {
      const validTypes = Object.values(ModalDialogActionType);
      validTypes.forEach((type) => {
        const template: ModalDialogTemplateModel = {
          modalDialogContent: {},
          modalDialogButtonsControl: { actionButtonControl: type, actionButtonLabel: 'Test' },
        } as ModalDialogTemplateModel;
        const result = mapModalRepositoryConfigToModalDialogConfig(template);
        expect(result.footerButtonsConfig?.actionButton).toBeDefined();
        expect(result.footerButtonsConfig?.actionButton?.label).toBe('Test');
      });
    });
  });

  describe('Secondary Button Validation', () => {
    it('should not create secondary button when secondaryButtonControl is invalid', () => {
      const template: ModalDialogTemplateModel = {
        modalDialogContent: {},
        modalDialogButtonsControl: {
          secondaryButtonControl: 'not-valid',
          secondaryButtonLabel: 'Secondary',
        },
      } as ModalDialogTemplateModel;
      const result = mapModalRepositoryConfigToModalDialogConfig(template);
      expect(result.footerButtonsConfig?.secondaryButton).toBeUndefined();
    });

    it('should not create secondary button when secondaryButtonControl is empty', () => {
      const template: ModalDialogTemplateModel = {
        modalDialogContent: {},
        modalDialogButtonsControl: {
          secondaryButtonControl: '',
          secondaryButtonLabel: 'Cancel',
        },
      } as ModalDialogTemplateModel;
      const result = mapModalRepositoryConfigToModalDialogConfig(template);
      expect(result.footerButtonsConfig?.secondaryButton).toBeUndefined();
    });

    it('should not create secondary button when secondaryButtonControl is undefined', () => {
      const template: ModalDialogTemplateModel = {
        modalDialogContent: {},
        modalDialogButtonsControl: {
          secondaryButtonLabel: 'Cancel',
        },
      } as ModalDialogTemplateModel;
      const result = mapModalRepositoryConfigToModalDialogConfig(template);
      expect(result.footerButtonsConfig?.secondaryButton).toBeUndefined();
    });
  });

  describe('Default Values', () => {
    it('should always set footerButtonsConfig.isVisible to true', () => {
      const template = createEmptyTemplate();
      const result = mapModalRepositoryConfigToModalDialogConfig(template);
      expect(result.footerButtonsConfig?.isVisible).toBe(true);
    });

    it('should always set layoutConfig.size to SMALL', () => {
      const template: ModalDialogTemplateModel = {
        modalDialogContent: { modalTitle: 'Test' },
        modalDialogButtonsControl: {},
      } as ModalDialogTemplateModel;
      const result = mapModalRepositoryConfigToModalDialogConfig(template);
      expect(result.layoutConfig?.size).toBe(ModalDialogSize.SMALL);
    });
  });

  describe('Security & Edge Cases', () => {
    it('should handle template with XSS attempts (pass through as-is)', () => {
      const template: ModalDialogTemplateModel = {
        modalDialogContent: {
          modalTitle: '<script>alert("XSS")</script>',
          modalDescription: '{{ malicious }}',
          modalImageSrc: 'javascript:alert(1)',
        },
        modalDialogButtonsControl: {
          actionButtonControl: ModalDialogActionType.CONFIRM,
          actionButtonLabel: '<b>Bold</b>',
        },
      } as ModalDialogTemplateModel;
      const result = mapModalRepositoryConfigToModalDialogConfig(template);
      expect(result.title).toBe('<script>alert("XSS")</script>');
      expect(result.introText).toBe('{{ malicious }}');
      expect(result.titleImageSrc).toBe('javascript:alert(1)');
    });

    it('should handle very long strings', () => {
      const longString = 'a'.repeat(10000);
      const template: ModalDialogTemplateModel = {
        modalDialogContent: {
          modalTitle: longString,
          modalDescription: longString,
        },
        modalDialogButtonsControl: {
          actionButtonControl: ModalDialogActionType.CONFIRM,
          actionButtonLabel: longString,
        },
      } as ModalDialogTemplateModel;
      const result = mapModalRepositoryConfigToModalDialogConfig(template);
      expect(result.title).toBe(longString);
      expect(result.introText).toBe(longString);
      expect(result.footerButtonsConfig?.actionButton?.label).toBe(longString);
    });
  });
});
