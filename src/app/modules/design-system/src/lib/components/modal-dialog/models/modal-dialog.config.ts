export interface ModalDialogConfig {
  title?: string;
  footerButtonsConfig?: {
    actionButton?: {
      label?: string;
      layout?: {
        size?: string;
        style?: string;
      };
    };
    secondaryButton?: {
      label?: string;
      layout?: {
        size?: string;
        style?: string;
      };
    };
  };
  layoutConfig?: {
    centered?: boolean;
    size?: string;
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
