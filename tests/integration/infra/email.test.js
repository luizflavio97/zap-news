import email from "infra/email.js";
import orchestrator from "tests/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
});

describe("infra/email.js", () => {
  test("send()", async () => {
    await orchestrator.deleteAllEmails();

    await email.send({
      from: "Fintab <contato@fintab.com.br>",
      to: "contato@curso.dev",
      subject: "Oi eu sou um email de teste",
      text: "Olá, este é um email de teste enviado pelo Nodemailer.",
    });

    const lastEmail = await orchestrator.fetchLastEmail();

    expect(lastEmail.sender).toBe("<contato@fintab.com.br>");
    expect(lastEmail.recipients[0]).toBe("<contato@curso.dev>");
    expect(lastEmail.subject).toBe("Oi eu sou um email de teste");
    expect(lastEmail.text).toBe(
      "Olá, este é um email de teste enviado pelo Nodemailer.\r\n",
    );
  });
});
