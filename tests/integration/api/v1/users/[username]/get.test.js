import { version as uuidVersion } from "uuid";
import orchestrator from "tests/orchestrator";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.cleanDatabase();
  await orchestrator.runPendingMigrations();
});

describe("GET /api/v1/users/[username]", () => {
  describe("Anonymous user", () => {
    test("With existing username, it should return the user", async () => {
      const createUserResponse = await fetch(
        "http://localhost:3000/api/v1/users",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "test_user",
            email: "test_user@example.com",
            password: "test_password",
          }),
        },
      );

      expect(createUserResponse.status).toBe(201);

      const getUserResponse = await fetch(
        "http://localhost:3000/api/v1/users/test_user",
      );

      expect(getUserResponse.status).toBe(200);

      const responseBody = await getUserResponse.json();

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
    });

    test("With not existing username, it should return the user", async () => {
      const getUserResponse = await fetch(
        "http://localhost:3000/api/v1/users/not_existing_user",
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
  });
});
