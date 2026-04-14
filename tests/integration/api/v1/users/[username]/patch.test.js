import { version as uuidVersion } from "uuid";
import userModel from "models/user.js";
import password from "models/password.js";
import orchestrator from "tests/orchestrator";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.cleanDatabase();
  await orchestrator.runPendingMigrations();
});

//TODO: Adapt other tests to use orchestrator method to create users and use faker.js
describe("PATCH /api/v1/users/[username]", () => {
  describe("Anonymous user", () => {
    test("With not existing username, it should return the user", async () => {
      const getUserResponse = await fetch(
        "http://localhost:3000/api/v1/users/not_existing_user",
        { method: "PATCH" },
      );

      expect(getUserResponse.status).toBe(404);

      const responseBody = await getUserResponse.json();

      expect(responseBody).toEqual({
        name: "DataNotFoundError",
        message: "Usuário não foi encontrado para o username informado",
        action: "Revise os dados enviados e tente novamente",
        statusCode: 404,
      });
    });

    test("With duplicate username, it should not update the user", async () => {
      await orchestrator.createUser({
        username: "username1",
      });

      await orchestrator.createUser({
        username: "username2",
      });

      const response = await fetch(
        "http://localhost:3000/api/v1/users/username1",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "username1",
            email: "teste2@example.com",
            password: "test_password",
          }),
        },
      );

      expect(response.status).toBe(400);
      const responseBodyError = await response.json();
      expect(responseBodyError).toEqual({
        name: "DataValidationError",
        message: "Dados inválidos para a operação com o usuário",
        action: "Revise os dados enviados e tente novamente",
        statusCode: 400,
      });
    });

    test("With duplicate email, it should not update the user", async () => {
      await orchestrator.createUser({
        email: "email1@example.com",
      });

      const createdUser2 = await orchestrator.createUser({
        email: "email2@example.com",
      });

      const response = await fetch(
        `http://localhost:3000/api/v1/users/${createdUser2.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "test_email",
            email: "email1@example.com",
            password: "test_password",
          }),
        },
      );

      expect(response.status).toBe(400);
      const responseBodyError = await response.json();
      expect(responseBodyError).toEqual({
        name: "DataValidationError",
        message: "Dados inválidos para a operação com o usuário",
        action: "Revise os dados enviados e tente novamente",
        statusCode: 400,
      });
    });

    test("With unique username, it should update the user", async () => {
      const user = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "unique_username",
          email: "unique_email@example.com",
          password: "test_password",
        }),
      });

      expect(user.status).toBe(201);

      const response = await fetch(
        "http://localhost:3000/api/v1/users/unique_username",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "unique_username2",
          }),
        },
      );

      expect(response.status).toBe(200);
      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "unique_username2",
        email: "unique_email@example.com",
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      expect(responseBody.updated_at > responseBody.created_at).toBe(true);
    });

    test("With unique email, it should update the user", async () => {
      const user = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "unique_email",
          email: "unique_email_test@example.com",
          password: "test_password",
        }),
      });

      expect(user.status).toBe(201);

      const response = await fetch(
        "http://localhost:3000/api/v1/users/unique_email",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: "unique_email_test2@example.com",
          }),
        },
      );

      expect(response.status).toBe(200);
      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "unique_email",
        email: "unique_email_test2@example.com",
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      expect(responseBody.updated_at > responseBody.created_at).toBe(true);
    });

    test("With new password, it should update the user", async () => {
      const user = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "new_password",
          email: "new_password@example.com",
          password: "test_password",
        }),
      });

      expect(user.status).toBe(201);

      const response = await fetch(
        "http://localhost:3000/api/v1/users/new_password",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            password: "new_test_password",
          }),
        },
      );

      expect(response.status).toBe(200);
      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "new_password",
        email: "new_password@example.com",
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      expect(responseBody.updated_at > responseBody.created_at).toBe(true);

      const userInDatabase = await userModel.findUserByUsername("new_password");
      const correctPasswordMatch = await password.compare(
        "new_test_password",
        userInDatabase.password,
      );

      const incorrectPasswordMatch = await password.compare(
        "test_password",
        userInDatabase.password,
      );

      expect(correctPasswordMatch).toBe(true);
      expect(incorrectPasswordMatch).toBe(false);
    });
  });
});
