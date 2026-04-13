import { version as uuidVersion } from "uuid";
import orchestrator from "tests/orchestrator";
import user from "models/user.js";
import password from "models/password.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.cleanDatabase();
  await orchestrator.runPendingMigrations();
});

describe("POST /api/v1/users", () => {
  describe("Anonymous user", () => {
    test("With unique and valid data, it should create a new user", async () => {
      const response = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "test_user",
          email: "test_user@example.com",
          password: "test_password",
        }),
      });

      expect(response.status).toBe(201);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "test_user",
        email: "test_user@example.com",
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      const userInDatabase = await user.findUserByUsername("test_user");
      const correctPasswordMatch = await password.compare(
        "test_password",
        userInDatabase.password,
      );

      const incorrectPasswordMatch = await password.compare(
        "wrong_password",
        userInDatabase.password,
      );

      expect(correctPasswordMatch).toBe(true);
      expect(incorrectPasswordMatch).toBe(false);
    });

    test("With duplicate email, it should not create a new user", async () => {
      const response1 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "emailduplicado1",
          email: "duplicated_test1@example.com",
          password: "test_password",
        }),
      });

      const response2 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "emailduplicado2",
          email: "Duplicated_test1@example.com",
          password: "test_password",
        }),
      });

      expect(response1.status).toBe(201);
      expect(response2.status).toBe(400);

      const responseBodyError = await response2.json();
      expect(responseBodyError).toEqual({
        name: "DataValidationError",
        message: "Dados inválidos para a operação com o usuário",
        action: "Revise os dados enviados e tente novamente",
        statusCode: 400,
      });
    });

    test("With duplicate username, it should not create a new user", async () => {
      const response1 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "usernameduplicado",
          email: "teste1@example.com",
          password: "test_password",
        }),
      });

      const response2 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "Usernameduplicado",
          email: "teste2@example.com",
          password: "test_password",
        }),
      });

      expect(response1.status).toBe(201);
      expect(response2.status).toBe(400);

      const responseBodyError = await response2.json();
      expect(responseBodyError).toEqual({
        name: "DataValidationError",
        message: "Dados inválidos para a operação com o usuário",
        action: "Revise os dados enviados e tente novamente",
        statusCode: 400,
      });
    });
  });
});
