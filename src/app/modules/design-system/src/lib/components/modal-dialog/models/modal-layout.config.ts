import { ModalDialogSize } from '../enums/modal-dialog-size.enum';

export interface ModalLayoutConfig {
  centered?: boolean;
  size?: ModalDialogSize;
  fullscreen?: boolean;
  modalOverlayClass?: string;
  modalWrapperClass?: string;
  modalDialogClass?: string;
  backdrop?: boolean | 'static';
}
