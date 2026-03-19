import { UsersApiClient } from '../../api/UsersApiClient';
import { UserFactory } from '../../factories/UserFactory';
import { Logger } from '../../utils/Logger';
import type { ApiUser } from '../../types';

/**
 * Users API Test Suite
 * Tags: smoke, regression, api
 * Target: https://reqres.in/api/users
 */

const log = new Logger('UsersApiTest');

describe('Users API | CRUD Tests', () => {
  const usersApi = new UsersApiClient();

  // ─── GET /users ────────────────────────────────────────────────────────────

  describe('GET /users', () => {
    it('[smoke] should return paginated user list with valid schema', () => {
      log.step('TC-API-001: GET /users — page 1');

      usersApi.getUsers(1).then((response) => {
        expect(response.status).to.equal(200);

        const body = response.body;

        usersApi.assertPaginationSchema(body);

        expect(body.page).to.equal(1);
        expect(body.data).to.have.length.greaterThan(0);

        body.data.forEach((user) => usersApi.assertUserSchema(user));

        log.info(`Retrieved ${body.data.length} users on page ${body.page}`);
      });
    });

    it('[regression] should return page 2 of users', () => {
      log.step('TC-API-002: GET /users — page 2');

      usersApi.getUsers(2).then((response) => {
        expect(response.status).to.equal(200);
        const body = response.body;
        expect(body.page).to.equal(2);
        expect(body.data).to.have.length.greaterThan(0);
      });
    });
  });

  // ─── GET /users/:id ────────────────────────────────────────────────────────

  describe('GET /users/:id', () => {
    it('[smoke] should return a single user by valid ID', () => {
      log.step('TC-API-003: GET /users/2');

      usersApi.getUserById(2).then((response) => {
        expect(response.status).to.equal(200);

        const body = response.body as { data: ApiUser };
        const user = body.data;

        usersApi.assertUserSchema(user);
        expect(user.id).to.equal(2);
        expect(user.email).to.be.a('string').and.include('@');

        log.info(`User: ${user.first_name} ${user.last_name}`);
      });
    });

    it('[regression] should return 404 for a non-existent user ID', () => {
      log.step('TC-API-004: GET /users/9999 → 404');

      usersApi
        .getUserById(9999, { failOnStatusCode: false })
        .then((response) => {
          expect(response.status).to.equal(404);
          expect(response.body).to.deep.equal({});
        });
    });
  });

  // ─── POST /users ───────────────────────────────────────────────────────────

  describe('POST /users', () => {
    it('[smoke] should create a new user and return 201 with created data', () => {
      log.step('TC-API-005: POST /users');

      const payload = UserFactory.buildApiPayload();
      log.info(`Creating user: ${payload.name} / ${payload.job}`);

      usersApi.createUser(payload).then((response) => {
        expect(response.status).to.equal(201);

        const body = response.body;

        expect(body.name).to.equal(payload.name);
        expect(body.job).to.equal(payload.job);
        expect(body.id).to.be.a('string').and.not.be.empty;
        expect(body.createdAt).to.be.a('string');

        const createdAt = new Date(body.createdAt);
        expect(createdAt.getTime()).to.not.be.NaN;

        log.info(`Created user ID: ${body.id}`);
      });
    });

    it('[regression] should create multiple users with factory-generated data', () => {
      log.step('TC-API-006: POST /users — multiple');

      const payloads = [
        UserFactory.buildApiPayload({ name: 'Alice Admin' }),
        UserFactory.buildApiPayload({ name: 'Bob Buyer' }),
      ];

      payloads.forEach((payload) => {
        usersApi.createUser(payload).then((response) => {
          expect(response.status).to.equal(201);
          const body = response.body;
          expect(body.name).to.equal(payload.name);
        });
      });
    });
  });

  // ─── PUT /users/:id ────────────────────────────────────────────────────────

  describe('PUT /users/:id', () => {
    it('[smoke] should fully update a user and return 200 with updatedAt', () => {
      log.step('TC-API-007: PUT /users/2');

      const payload = { name: 'Updated Name', job: 'Senior QA Engineer' };

      usersApi.updateUser(2, payload).then((response) => {
        expect(response.status).to.equal(200);

        const body = response.body as { name: string; job: string; updatedAt: string };
        expect(body.name).to.equal(payload.name);
        expect(body.job).to.equal(payload.job);
        expect(body.updatedAt).to.be.a('string');
      });
    });
  });

  // ─── PATCH /users/:id ──────────────────────────────────────────────────────

  describe('PATCH /users/:id', () => {
    it('[regression] should partially update a user job title', () => {
      log.step('TC-API-008: PATCH /users/2');

      const payload = { job: 'Principal Automation Architect' };

      usersApi.patchUser(2, payload).then((response) => {
        expect(response.status).to.equal(200);

        const body = response.body as { job: string; updatedAt: string };
        expect(body.job).to.equal(payload.job);
        expect(body.updatedAt).to.be.a('string');
      });
    });
  });

  // ─── DELETE /users/:id ─────────────────────────────────────────────────────

  describe('DELETE /users/:id', () => {
    it('[smoke] should delete a user and return 204 No Content', () => {
      log.step('TC-API-009: DELETE /users/2');

      usersApi.deleteUser(2).then((response) => {
        expect(response.status).to.equal(204);
        expect(response.body).to.be.empty;
        log.info('User deleted — 204 received');
      });
    });
  });
});
