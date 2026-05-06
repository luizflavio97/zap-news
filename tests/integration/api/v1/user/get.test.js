import orchestrator from "tests/orchestrator";
import session from "models/session.js";
import setCookieParser from "set-cookie-parser";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.cleanDatabase();
  await orchestrator.runPendingMigrations();
});

describe("GET /api/v1/user", () => {
  describe("Default user", () => {
    test("With valid session", async () => {
      const createdUser = await orchestrator.createUser({
        username: "UserWithValidSession",
      });

      const sessionObj = await orchestrator.createSession(createdUser.id);

      const response = await fetch("http://localhost:3000/api/v1/user", {
        headers: {
          Cookie: `session_id=${sessionObj.token}`,
        },
      });

      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: createdUser.id,
        username: createdUser.username,
        email: createdUser.email,
        password: createdUser.password,
        created_at: createdUser.created_at.toISOString(),
        updated_at: createdUser.updated_at.toISOString(),
      });

      // Session renewal assertions
      const renewedSessionObject = await session.findSessionValidByToken(
        sessionObj.token,
      );

      expect(renewedSessionObject.expires_at > sessionObj.expires_at).toEqual(
        true,
      );
      expect(renewedSessionObject.updated_at > sessionObj.updated_at).toEqual(
        true,
      );

      // Set-Cookie assertions

      const parsedSetCookie = setCookieParser(response, {
        map: true,
      });

      expect(parsedSetCookie).toHaveProperty("session_id");
      expect(parsedSetCookie.session_id.value).toBe(sessionObj.token);
      expect(parsedSetCookie.session_id.path).toBe("/");
      expect(parsedSetCookie.session_id.httpOnly).toBe(true);
    });

    test("With non existent session", async () => {
      const nonExistentToken =
        "ff12da33a73679dfadb10799a17f3efc5c86b69ddd44a092f207045d6b28f9613d2a853c93439a01207df2b6a5929213";

      const response = await fetch("http://localhost:3000/api/v1/user", {
        headers: {
          Cookie: `session_id=${nonExistentToken}`,
        },
      });

      expect(response.status).toBe(401);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "UnauthorizedError",
        message: "Usuário não possui sessão válida",
        action: "Verifique se o usuário esta logado e tente novamente",
        statusCode: 401,
      });
    });

    test("With expired session", async () => {
      jest.useFakeTimers({
        now: new Date(Date.now() - session.EXPIRATION_IN_MILLISECONDS),
      });

      const createdUser = await orchestrator.createUser({
        username: "UserWithExpiredSession",
      });

      const sessionObj = await orchestrator.createSession(createdUser.id);

      jest.useRealTimers();

      const response = await fetch("http://localhost:3000/api/v1/user", {
        headers: {
          Cookie: `session_id=${sessionObj.token}`,
        },
      });

      expect(response.status).toBe(401);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "UnauthorizedError",
        message: "Usuário não possui sessão válida",
        action: "Verifique se o usuário esta logado e tente novamente",
        statusCode: 401,
      });
    });
  });
});
