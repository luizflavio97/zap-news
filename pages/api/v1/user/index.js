import { createRouter } from "next-connect";
import session from "models/session.js";
import user from "models/user.js";
import controller from "infra/controller.js";

const router = createRouter();

router.get(getHandler);

export default router.handler(controller.errorHandlers);

async function getHandler(req, res) {
  const sessionToken = req.cookies.session_id;

  const foundSession = await session.findSessionValidByToken(sessionToken);
  const renewedSession = await session.renew(foundSession.id);
  await controller.setSessionCookie(renewedSession.token, res);
  const foundUser = await user.findUserById(foundSession.user_id);

  return res.status(200).json(foundUser);
}
