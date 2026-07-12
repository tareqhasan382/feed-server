export interface ApiSuccessResponse<T> {
  success: true;
  message: string;
  data: T;
}

export function successResponse<T>(
  data: T,
  message = 'Operation completed successfully',
): ApiSuccessResponse<T> {
  return {
    success: true,
    message,
    data,
  };
}
