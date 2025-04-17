export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  error: string;
  data: T;
  meta: Record<string, unknown>;
}
