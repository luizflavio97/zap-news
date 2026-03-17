import { DataNotFoundError } from "./errors";
import {
  InternalServerError,
  MethodNotAllowed,
  DataValidationError,
} from "/infra/errors.js";

function onErrorHandler(err, req, res) {
  if (err instanceof DataValidationError || err instanceof DataNotFoundError) {
    res.status(err.statusCode).json(err);
    return;
  }

  const publicErrorObject = new InternalServerError({
    cause: err,
    statusCode: err.statusCode,
  });

  console.error(publicErrorObject);
  res.status(publicErrorObject.statusCode).json(publicErrorObject);
}

function onNoMatchHandler(req, res) {
  const publicErrorObject = new MethodNotAllowed();
  res.status(405).json(publicErrorObject);
}

const controller = {
  errorHandlers: {
    onNoMatch: onNoMatchHandler,
    onError: onErrorHandler,
  },
};

export default controller;
