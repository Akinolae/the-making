export interface ApiError {
  error: {
    message: string;
    stack?: string;
  };
}
