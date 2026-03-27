export interface RfErrorMessageSingleComponent {
  [errorKey: string]: string | undefined;
}

export interface RfErrorMessageMultipleComponent {
  [errorKey: string]: RfErrorMessageSingleComponent | undefined;
}
