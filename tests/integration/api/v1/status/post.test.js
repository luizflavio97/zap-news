import orchestrator from "tests/orchestrator";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
});

describe("POST /api/v1/status", () => {
  describe("Anonymous user", () => {
    test("POST to /api/v1/status should return 200", async () => {
      const res = await fetch("http://localhost:3000/api/v1/status", {
        method: "POST",
      });

      expect(res.status).toBe(405);

      const resBody = await res.json();
      expect(resBody).toEqual({
        name: "MethodNotAllowedError",
        message: "Método não permitido",
        action:
          "Verifique se o método HTTP esta disponível para este endpoint.",
        statusCode: 405,
      });
    });
  });
});
