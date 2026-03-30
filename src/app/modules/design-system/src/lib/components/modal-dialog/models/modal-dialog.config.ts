export interface ModalDialogConfig {
  title?: string;
  layoutConfig?: {
    centered?: boolean;
    size?: 'sm' | 'lg' | 'xl' | string;
    fullscreen?: boolean | string;
    modalOverlayClass?: string;
    modalWrapperClass?: string;
    modalDialogClass?: string;
    backdrop?: boolean | 'static';
  };
  ariaAttributes?: {
    ariaLabelledBy?: string;
    ariaDescribedBy?: string;
  };
}
