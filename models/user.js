import database from "infra/database.js";
import password from "models/password.js";
import { DataValidationError, DataNotFoundError } from "infra/errors.js";

async function createUser(newUserInput) {
  await validateUniqueEmail(newUserInput.email);
  await validateUniqueUsername(newUserInput.username);
  await hashPasswordInObject(newUserInput);

  const newUser = await runInsertQuery(newUserInput);

  return newUser;

  async function runInsertQuery(newUserInput) {
    const result = await database.query({
      text: `insert into 
      users (username, email, password) 
    values 
      ($1, $2, $3)
    returning
      *
    ;`,
      values: [
        newUserInput.username,
        newUserInput.email,
        newUserInput.password,
      ],
    });
    return result.rows[0];
  }
}

async function updateUser(username, updatedUserInput) {
  const currentUser = await findUserByUsername(username);

  if ("username" in updatedUserInput) {
    await validateUniqueUsername(updatedUserInput.username);
  }

  if ("email" in updatedUserInput) {
    await validateUniqueEmail(updatedUserInput.email);
  }

  if ("password" in updatedUserInput) {
    await hashPasswordInObject(updatedUserInput);
  }

  const updatedUser = { ...currentUser, ...updatedUserInput };

  const result = await runUpdateQuery(updatedUser);
  return result;

  async function runUpdateQuery(updatedUser) {
    const result = await database.query({
      text: `update 
        users 
      set 
        username = $1,
        email = $2,
        password = $3,
        updated_at = timezone('utc', now())
      where 
        id = $4
      returning
        *
      ;`,
      values: [
        updatedUser.username,
        updatedUser.email,
        updatedUser.password,
        updatedUser.id,
      ],
    });

    return result.rows[0];
  }
}

async function validateUniqueUsername(username) {
  const result = await database.query({
    text: `select 
        * 
      from 
        users 
      where 
        lower(username) = lower($1)`,
    values: [username],
  });

  if (result.rowCount > 0) {
    throw new DataValidationError({
      message: "Dados inválidos para a operação com o usuário",
      action: "Revise os dados enviados e tente novamente",
    });
  }
}

async function validateUniqueEmail(email) {
  const result = await database.query({
    text: `select 
        * 
      from 
        users 
      where 
        lower(email) = lower($1)`,
    values: [email],
  });

  if (result.rowCount > 0) {
    throw new DataValidationError({
      message: "Dados inválidos para a operação com o usuário",
      action: "Revise os dados enviados e tente novamente",
    });
  }
}

async function findUserByUsername(username) {
  const foundUser = await runSelectQuery(username);

  return foundUser;

  async function runSelectQuery(username) {
    const result = await database.query({
      text: `select 
        * 
      from 
        users 
      where 
        lower(username) = lower($1)
      limit
        1
      ;`,
      values: [username],
    });

    if (result.rowCount === 0) {
      throw new DataNotFoundError({
        message: "Usuário não foi encontrado para o username informado",
        action: "Revise os dados enviados e tente novamente",
      });
    }

    return result.rows[0];
  }
}

async function findUserByEmail(email) {
  const foundUser = await runSelectQueryByEmail(email);

  return foundUser;

  async function runSelectQueryByEmail(email) {
    const result = await database.query({
      text: `select 
        * 
      from 
        users 
      where 
        lower(email) = lower($1)
      limit
        1
      ;`,
      values: [email],
    });

    if (result.rowCount === 0) {
      throw new DataNotFoundError({
        message: "Usuário não foi encontrado com as informações informadas",
        action: "Revise os dados enviados e tente novamente",
      });
    }

    return result.rows[0];
  }
}

async function findUserById(id) {
  const foundUser = await runSelectQuery(id);

  return foundUser;

  async function runSelectQuery(id) {
    const result = await database.query({
      text: `select 
        * 
      from 
        users 
      where 
        id = $1
      limit
        1
      ;`,
      values: [id],
    });

    if (result.rowCount === 0) {
      throw new DataNotFoundError({
        message: "Usuário não foi encontrado para o ID informado",
        action: "Revise os dados enviados e tente novamente",
      });
    }

    return result.rows[0];
  }
}

async function hashPasswordInObject(newUserInput) {
  const hashedPassword = await password.hash(newUserInput.password);
  newUserInput.password = hashedPassword;
}

const user = {
  createUser,
  updateUser,
  findUserByUsername,
  findUserByEmail,
  findUserById,
};

export default user;
