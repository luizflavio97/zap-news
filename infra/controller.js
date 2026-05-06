import * as cookie from "cookie";
import session from "models/session.js";
import { DataNotFoundError } from "./errors";
import {
  InternalServerError,
  MethodNotAllowed,
  DataValidationError,
  UnauthorizedError,
} from "/infra/errors.js";

function onErrorHandler(err, req, res) {
  if (
    err instanceof DataValidationError ||
    err instanceof DataNotFoundError ||
    err instanceof UnauthorizedError
  ) {
    res.status(err.statusCode).json(err);
    return;
  }

  const publicErrorObject = new InternalServerError({
    cause: err,
  });

  console.error(publicErrorObject);
  res.status(publicErrorObject.statusCode).json(publicErrorObject);
}

function onNoMatchHandler(req, res) {
  const publicErrorObject = new MethodNotAllowed();
  res.status(405).json(publicErrorObject);
}

async function setSessionCookie(sessionToken, res) {
  const setCookie = cookie.serialize("session_id", sessionToken, {
    path: "/",
    maxAge: session.EXPIRATION_IN_MILLISECONDS / 1000,
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
  });

  res.setHeader("Set-Cookie", setCookie);
}

async function clearSessionCookie(res) {
  const setCookie = cookie.serialize("session_id", "invalid", {
    path: "/",
    maxAge: -1,
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
  });

  res.setHeader("Set-Cookie", setCookie);
}

const controller = {
  errorHandlers: {
    onNoMatch: onNoMatchHandler,
    onError: onErrorHandler,
  },
  setSessionCookie,
  clearSessionCookie,
};

export default controller;
