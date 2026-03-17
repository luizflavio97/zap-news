import { createRouter } from "next-connect";
import user from "models/user.js";
import controller from "infra/controller.js";

const router = createRouter();

router.post(postHandler);

export default router.handler(controller.errorHandlers);

async function postHandler(req, res) {
  const newUserInput = req.body;
  const createdUser = await user.createUser(newUserInput);
  return res.status(201).json(createdUser);
}
