/**
 * Handle ResponseStructure<T> from Java backend
 * Transforms Java backend response to clean data or throws error
 */

export interface ResponseStructure<T = any> {
  result: {
    status: 'SUCCESS' | 'FAILURE';
    message: string;
  };
  data: T;
}

export function handleResponseStructure<T>(
  response: ResponseStructure<T>
): { result: ResponseStructure<T>['result']; data: T } {
  const { result, data } = response;

  if (!result || !('status' in result)) {
    throw new Error('Invalid response structure from backend');
  }

  if (result.status === 'FAILURE') {
    throw new Error(result.message || 'Request failed');
  }

  return { result, data };
}

export function isResponseStructure(obj: any): obj is ResponseStructure {
  return (
    obj &&
    obj.result &&
    obj.result.status &&
    ('data' in obj)
  );
}
