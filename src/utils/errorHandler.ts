import { message } from 'antd';
import { AxiosError } from 'axios';

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

export const handleApiError = (error: unknown): ApiError => {
  if (error instanceof AxiosError) {
    const status = error.response?.status;
    const data = error.response?.data;
    
    // Handle different HTTP status codes
    switch (status) {
      case 400:
        return {
          message: data?.detail || 'Bad request. Please check your input.',
          status,
          code: 'BAD_REQUEST'
        };
      case 401:
        return {
          message: 'Unauthorized. Please log in again.',
          status,
          code: 'UNAUTHORIZED'
        };
      case 403:
        return {
          message: 'Forbidden. You do not have permission to perform this action.',
          status,
          code: 'FORBIDDEN'
        };
      case 404:
        return {
          message: data?.detail || 'Resource not found.',
          status,
          code: 'NOT_FOUND'
        };
      case 422:
        return {
          message: 'Validation error. Please check your input.',
          status,
          code: 'VALIDATION_ERROR'
        };
      case 500:
        return {
          message: 'Internal server error. Please try again later.',
          status,
          code: 'INTERNAL_ERROR'
        };
      default:
        return {
          message: data?.detail || error.message || 'An unexpected error occurred.',
          status,
          code: 'UNKNOWN_ERROR'
        };
    }
  }
  
  if (error instanceof Error) {
    return {
      message: error.message,
      code: 'CLIENT_ERROR'
    };
  }
  
  return {
    message: 'An unknown error occurred.',
    code: 'UNKNOWN_ERROR'
  };
};

export const showErrorMessage = (error: unknown, customMessage?: string) => {
  const apiError = handleApiError(error);
  message.error(customMessage || apiError.message);
  
  // Log error for debugging
  console.error('API Error:', apiError, error);
};

export const showSuccessMessage = (text: string) => {
  message.success(text);
};

export const showWarningMessage = (text: string) => {
  message.warning(text);
};

export const showInfoMessage = (text: string) => {
  message.info(text);
};

// Network connectivity check
export const checkNetworkConnectivity = async (): Promise<boolean> => {
  try {
    const response = await fetch('/api/health', {
      method: 'HEAD',
      cache: 'no-cache'
    });
    return response.ok;
  } catch {
    return false;
  }
};

// Retry mechanism for failed requests
export const retryRequest = async <T>(
  requestFn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: unknown;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error;
      
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
      }
    }
  }
  
  throw lastError;
};
