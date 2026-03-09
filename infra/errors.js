export class InternalServerError extends Error {
  constructor({ cause, statusCode }) {
    super("Um erro interno não esperado ocorreu.", {
      cause,
    });
    this.name = "InternalServerError";
    this.action = "Entre em contato com o suporte";
    this.statusCode = statusCode || 500;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      statusCode: this.statusCode,
    };
  }
}

export class ServiceError extends Error {
  constructor({ cause }) {
    super("Serviço indisponível.", {
      cause,
    });
    this.name = "ServiceError";
    this.action = "Tente novamente mais tarde";
    this.statusCode = 503;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      statusCode: this.statusCode,
    };
  }
}

export class MethodNotAllowed extends Error {
  constructor() {
    super("Método não permitido");
    this.name = "MethodNotAllowedError";
    this.action =
      "Verifique se o método HTTP esta disponível para este endpoint.";
    this.statusCode = 405;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      statusCode: this.statusCode,
    };
  }
}
