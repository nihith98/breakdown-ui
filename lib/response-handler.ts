export interface ResponseStructure<T = unknown> {
  responseStatus: 'SUCCESS' | 'FAILURE';
  responseMessage: string;
  responseObject: T | null;
}

export interface AuthResponseStructure<T = unknown> {
  responseStatus: 'SUCCESS' | 'FAILURE';
  messages: {
    informationMessages: string[];
    warningMessages: string[];
    errorMessages: string[];
  };
  payload: T | null | false;
}

export function handleResponseStructure<T>(response: ResponseStructure<T>): T {
  if (response.responseStatus === 'FAILURE') {
    throw new Error(response.responseMessage || 'Request failed');
  }
  return response.responseObject as T;
}

export function handleAuthResponseStructure<T>(response: AuthResponseStructure<T>): T {
  if (response.responseStatus === 'FAILURE') {
    const errorMsg = response.messages.errorMessages?.[0] || 'Request failed';
    throw new Error(errorMsg);
  }
  return response.payload as T;
}
