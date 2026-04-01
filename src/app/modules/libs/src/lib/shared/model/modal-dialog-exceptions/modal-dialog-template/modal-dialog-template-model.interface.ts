import { ModalDialogButtonsControl } from './modal-dialog-buttons-control.interface';
import { ModalDialogContent } from './modal-dialog-content.interface';
import { ModalDialogSettings } from './modal-dialog-settings.interface';

export interface ModalDialogTemplateModel {
  modalDialogContent: ModalDialogContent;
  modalDialogButtonsControl: ModalDialogButtonsControl;
  modalDialogSettings: ModalDialogSettings;
}
