import { createRouter } from "next-connect";
import authentication from "models/authentication.js";
import controller from "infra/controller.js";
import session from "models/session.js";

const router = createRouter();

router.post(postHandler);

export default router.handler(controller.errorHandlers);

async function postHandler(req, res) {
  const newUserInput = req.body;

  const authenticatedUser = await authentication.getAuthenticatedUser(
    newUserInput.email,
    newUserInput.password,
  );

  const newSession = await session.create(authenticatedUser.id);

  await controller.setSessionCookie(newSession.token, res);

  return res.status(201).json(newSession);
}
