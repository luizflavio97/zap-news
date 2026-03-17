import database from "infra/database.js";
import { DataValidationError } from "infra/errors.js";

async function createUser(newUserInput) {
  await validateUniqueEmail(newUserInput.email);
  await validateUniqueUsername(newUserInput.username);

  const newUser = await runInsertQuery(newUserInput);

  return newUser;

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
        message: "Dados inválidos para criação de usuário",
        action: "Revise os dados enviados e tente novamente",
      });
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
        message: "Dados inválidos para criação de usuário",
        action: "Revise os dados enviados e tente novamente",
      });
    }
  }

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

const user = {
  createUser,
};

export default user;
