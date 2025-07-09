import { AxiosError } from 'axios';

export interface ApiErrorResponse {
  message: string;
  statusCode?: number;
  error?: string;
}

export interface RoleData {
  name: string;
  [key: string]: string | number | boolean | null | undefined;
}

export type ApiError = AxiosError<ApiErrorResponse>; 