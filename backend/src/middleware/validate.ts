import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";

type RequestSchemas = {
  body?: ZodType;
  query?: ZodType;
  params?: ZodType;
};

export function validate(schemas: RequestSchemas) {
  return (request: Request, _response: Response, next: NextFunction): void => {
    if (schemas.body) {
      request.body = schemas.body.parse(request.body);
    }

    if (schemas.query) {
      schemas.query.parse(request.query);
    }

    if (schemas.params) {
      schemas.params.parse(request.params);
    }

    next();
  };
}
