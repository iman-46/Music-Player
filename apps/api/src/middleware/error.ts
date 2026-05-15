import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { HttpError } from "../utils/http.js";

export const notFound: ErrorRequestHandler = (req, _res, next) => {
  next(new HttpError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof ZodError) {
    return res
      .status(422)
      .json({ message: "Validation failed", issues: error.flatten() });
  }

  if (error instanceof HttpError) {
    return res
      .status(error.statusCode)
      .json({ message: error.message, details: error.details });
  }

  const statusCode =
    typeof error.statusCode === "number" ? error.statusCode : 500;
  const message = statusCode === 500 ? "Something went wrong" : error.message;
  return res.status(statusCode).json({ message });
};
