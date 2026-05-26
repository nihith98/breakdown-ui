import axios, { AxiosError } from 'axios';

const API_HOST = process.env.API_HOST || 'http://localhost:8080';

function createClient(basePath: string) {
  const client = axios.create({
    baseURL: `${API_HOST}${basePath}`,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  client.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      console.error('API error:', error.response?.status, error.message);
      return Promise.reject(error);
    }
  );

  return client;
}

export const authApiClient = createClient(process.env.AUTH_BASE_URL || '/authentication-svc');
export const registrationApiClient = createClient(process.env.REGISTRATION_BASE_URL || '/registration-svc');
export const groupAdminApiClient = createClient(process.env.GROUP_ADMIN_BASE_URL || '/group-admin-svc');
export const groupViewApiClient = createClient(process.env.GROUP_VIEW_BASE_URL || '/group-view-svc');

export default authApiClient;
