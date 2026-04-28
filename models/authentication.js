import user from "models/user.js";
import password from "models/password.js";
import { UnauthorizedError, DataNotFoundError } from "infra/errors.js";

async function getAuthenticatedUser(providedEmail, providedPassword) {
  try {
    const foundUser = await findUserByEmail(providedEmail, providedPassword);
    await validatePassword(providedPassword, foundUser.password);

    return foundUser;
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      throw new UnauthorizedError({
        message: "Dados incorretos",
        action: "Revise os dados enviados e tente novamente",
        statusCode: 401,
      });
    }

    throw error;
  }

  async function findUserByEmail(providedEmail) {
    let foundUser;
    try {
      foundUser = await user.findUserByEmail(providedEmail);
    } catch (error) {
      if (error instanceof DataNotFoundError) {
        throw new UnauthorizedError({
          message: "Email não confere",
          action: "Revise os dados enviados e tente novamente",
          statusCode: 401,
        });
      }

      throw error;
    }

    return foundUser;
  }

  async function validatePassword(providedPassword, foundUserPassword) {
    const passwordMatch = await password.compare(
      providedPassword,
      foundUserPassword,
    );

    if (!passwordMatch) {
      throw new UnauthorizedError({
        message: "Dados incorretos",
        action: "Revise os dados enviados e tente novamente",
        statusCode: 401,
      });
    }
  }
}

const authentication = {
  getAuthenticatedUser,
};

export default authentication;
