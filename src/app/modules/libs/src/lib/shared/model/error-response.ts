export interface ErrorResponse {
  error?: {
    errors?: [
      {
        description: string;
      },
    ];
  };
  name?: string;
}
