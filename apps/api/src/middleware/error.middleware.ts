import { Request, Response, NextFunction } from "express";

export const globalErrorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const statusCode = err.statusCode || 500;
  const message    = err.isOperational ? err.message : "An unexpected error occurred";

  // Always log unexpected errors so we can see them in the terminal
  if (!err.isOperational) {
    console.error("[UNHANDLED ERROR]", err);
  }

  res.status(statusCode).json({
    status:  statusCode >= 500 ? "error" : "fail",
    message,
    ...(process.env.NODE_ENV !== "production" && !err.isOperational && {
      debug: err?.message,
      stack: err?.stack?.split("\n").slice(0, 5),
    }),
  });
};
