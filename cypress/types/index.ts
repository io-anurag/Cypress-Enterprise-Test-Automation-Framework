/**
 * Shared TypeScript interfaces and types for the entire framework.
 * Import from @types-app to consume anywhere in the project.
 */

export interface EnvConfiguration {
  baseUrl: string;
  apiBaseUrl: string;
  credentials: {
    username: string;
    password: string;
  };
  featureFlags?: Record<string, boolean>;
}

export type UserRole = 'admin' | 'editor' | 'viewer' | 'buyer';

export interface User {
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  role: UserRole;
  avatar?: string;
}

export interface ApiUser {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  avatar: string;
}

export interface CreateUserPayload {
  name: string;
  job: string;
}

export interface CreateUserResponse {
  name: string;
  job: string;
  id: string;
  createdAt: string;
}

export interface UpdateUserPayload {
  name?: string;
  job?: string;
}

export interface UpdateUserResponse {
  name: string;
  job: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
  data: T[];
  support?: {
    url: string;
    text: string;
  };
}

export interface SingleResponse<T> {
  data: T;
  support?: {
    url: string;
    text: string;
  };
}

export interface ApiError {
  error: string;
  message?: string;
  statusCode?: number;
}

export type TestTag = 'smoke' | 'regression' | 'api' | 'ui' | 'e2e' | 'critical' | 'flaky';


export interface Credentials {
  username: string;
  password: string;
}


export interface ApiRequestOptions {
  headers?: Record<string, string>;
  timeout?: number;
  failOnStatusCode?: boolean;
  retries?: number;
}


export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

export interface LogEntry {
  level: LogLevel;
  message: string;
  context?: string;
  timestamp: string;
  data?: unknown;
}


export interface SeedOptions {
  userCount?: number;
  productCount?: number;
  cleanup?: boolean;
}

export interface SeededData {
  users: User[];
  createdIds: number[];
  cleanup: () => void;
}
