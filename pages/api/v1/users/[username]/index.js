import { createRouter } from "next-connect";
import user from "models/user.js";
import controller from "infra/controller.js";

const router = createRouter();

router.get(getHandler);

export default router.handler(controller.errorHandlers);

async function getHandler(req, res) {
  const username = req.query.username;
  const foundUser = await user.findUserByUsername(username);
  return res.status(200).json(foundUser);
}
