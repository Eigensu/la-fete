/* global fetch, Response */
export type AuthPayload = {
  accessToken: string;
  user: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
};

export type LoginInput = {
  email: string;
  password: string;
};

export type RegisterInput = LoginInput & {
  phone: string;
  firstName: string;
  lastName: string;
};

async function parseResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type') || '';
  const body = contentType.includes('application/json') ? await response.json() : null;

  if (!response.ok) {
    throw new Error(body?.message || 'Request failed');
  }

  return body as T;
}

export async function login(input: LoginInput) {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(input),
  });

  return parseResponse<AuthPayload>(response);
}

export async function register(input: RegisterInput) {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(input),
  });

  return parseResponse<AuthPayload>(response);
}

export async function refreshSession() {
  const response = await fetch('/api/auth/refresh', {
    method: 'POST',
    credentials: 'include',
  });

  return parseResponse<{ accessToken: string }>(response);
}

export async function logout() {
  const accessToken = typeof globalThis !== 'undefined' ? globalThis.localStorage?.getItem('la-fete-access-token') : null;
  const response = await fetch('/api/auth/logout', {
    method: 'POST',
    headers: accessToken ? { 'Authorization': 'Bearer ' + accessToken } : {},
    credentials: 'include',
  });

  return parseResponse<{ success: boolean }>(response);
}

export function getGoogleAuthUrl() {
  return '/api/auth/google';
}

export async function fetchUserProfile(token?: string) {
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch('/api/users/profile', {
    method: 'GET',
    headers,
    credentials: 'include',
  });

  return parseResponse<{ id: string; email: string; firstName?: string; lastName?: string; role: string }>(response);
}
