/**
 * Custom error classes mapped to HTTP status codes for the domain layer
 * to throw so controllers can catch and respond predictably.
 */

export class ActionError extends Error {
  public statusCode: number;
  public details?: any;

  constructor(message: string, statusCode: number = 500, details?: any) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.details = details;
  }
}

export class ValidationError extends ActionError {
  constructor(message: string, details?: any) {
    super(message, 400, details);
  }
}

export class UnauthorizedError extends ActionError {
  constructor(message: string = "Não autorizado") {
    super(message, 401);
  }
}

export class ForbiddenError extends ActionError {
  constructor(message: string = "Proibido") {
    super(message, 403);
  }
}

export class NotFoundError extends ActionError {
  constructor(message: string = "Não encontrado") {
    super(message, 404);
  }
}

export class ConflictError extends ActionError {
  constructor(message: string = "Conflito", details?: any) {
    super(message, 409, details);
  }
}
