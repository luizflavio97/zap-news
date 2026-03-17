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

export class DataValidationError extends Error {
  constructor({ cause, message, action }) {
    super(message || "Um erro de validação de dados ocorreu.", {
      cause,
    });
    this.name = "DataValidationError";
    this.action = action || "Ajustes os dados enviados e tente novamente";
    this.statusCode = 400;
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

export class DataNotFoundError extends Error {
  constructor({ cause, message, action }) {
    super(message || "A consulta realizada não retornou resultados.", {
      cause,
    });
    this.name = "DataNotFoundError";
    this.action = action || "Ajustes os dados da consulta e tente novamente";
    this.statusCode = 404;
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
