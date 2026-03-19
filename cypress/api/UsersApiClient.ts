import { ApiClient } from './ApiClient';
import type {
  ApiUser,
  CreateUserPayload,
  CreateUserResponse,
  UpdateUserPayload,
  UpdateUserResponse,
  PaginatedResponse,
  SingleResponse,
  ApiRequestOptions,
} from '../types';

/**
 * UsersApiClient — Encapsulates all /users endpoint interactions.
 * Target API: https://reqres.in/api/users
 *
 * Usage:
 *   const usersApi = new UsersApiClient();
 *   usersApi.getUsers(1).then(response => { ... });
 */
export class UsersApiClient extends ApiClient {
  private readonly endpoint = '/users';

  constructor() {
    super('UsersApiClient');
  }

  // ─── GET Endpoints ────────────────────────────────────────────────────────────

  /**
   * GET /users?page={page} — Paginated list of users
   */
  getUsers(page = 1, options?: ApiRequestOptions): Cypress.Chainable<Cypress.Response<PaginatedResponse<ApiUser>>> {
    this.log.step(`Fetching users — page ${page}`);
    return this.get<PaginatedResponse<ApiUser>>(`${this.endpoint}?page=${page}`, options);
  }

  /**
   * GET /users/{id} — Single user by ID
   */
  getUserById(id: number, options?: ApiRequestOptions): Cypress.Chainable<Cypress.Response<SingleResponse<ApiUser>>> {
    this.log.step(`Fetching user by ID: ${id}`);
    return this.get<SingleResponse<ApiUser>>(`${this.endpoint}/${id}`, options);
  }

  // ─── POST Endpoints ───────────────────────────────────────────────────────────

  /**
   * POST /users — Create a new user
   */
  createUser(payload: CreateUserPayload, options?: ApiRequestOptions): Cypress.Chainable<Cypress.Response<CreateUserResponse>> {
    this.log.step(`Creating user: ${payload.name}`);
    return this.post<CreateUserResponse>(this.endpoint, payload, options);
  }

  // ─── PUT / PATCH Endpoints ────────────────────────────────────────────────────

  /**
   * PUT /users/{id} — Full update of a user
   */
  updateUser(id: number, payload: UpdateUserPayload, options?: ApiRequestOptions): Cypress.Chainable<Cypress.Response<UpdateUserResponse>> {
    this.log.step(`Updating user ID ${id} (PUT)`);
    return this.put<UpdateUserResponse>(`${this.endpoint}/${id}`, payload, options);
  }

  /**
   * PATCH /users/{id} — Partial update of a user
   */
  patchUser(id: number, payload: Partial<UpdateUserPayload>, options?: ApiRequestOptions): Cypress.Chainable<Cypress.Response<UpdateUserResponse>> {
    this.log.step(`Patching user ID ${id} (PATCH)`);
    return this.patch<UpdateUserResponse>(`${this.endpoint}/${id}`, payload, options);
  }

  // ─── DELETE Endpoints ─────────────────────────────────────────────────────────

  /**
   * DELETE /users/{id} — Delete a user by ID
   */
  deleteUser(id: number, options?: ApiRequestOptions): Cypress.Chainable<Cypress.Response<void>> {
    this.log.step(`Deleting user ID: ${id}`);
    return this.delete<void>(`${this.endpoint}/${id}`, options);
  }

  // ─── Schema Validation Helpers ────────────────────────────────────────────────

  /**
   * Assert that the user object has required fields and correct types.
   */
  assertUserSchema(user: ApiUser): void {
    expect(user).to.have.property('id').that.is.a('number');
    expect(user).to.have.property('email').that.is.a('string').and.include('@');
    expect(user).to.have.property('first_name').that.is.a('string');
    expect(user).to.have.property('last_name').that.is.a('string');
    expect(user).to.have.property('avatar').that.is.a('string');
  }

  /**
   * Assert that paginated response structure is valid.
   */
  assertPaginationSchema(response: PaginatedResponse<ApiUser>): void {
    expect(response).to.have.property('page').that.is.a('number');
    expect(response).to.have.property('per_page').that.is.a('number');
    expect(response).to.have.property('total').that.is.a('number');
    expect(response).to.have.property('total_pages').that.is.a('number');
    expect(response).to.have.property('data').that.is.an('array');
  }
}
