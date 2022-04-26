import { NextFunction, Response } from "express"
import { CustomDomainError } from "./customError"

const errorHandler = (
  err: Error | CustomDomainError,
  req: any,
  res: Response,
  next: NextFunction
): any => {
  if (err instanceof CustomDomainError) {
    res.status(err.status).json({ success: false, message: err.message })
  } else {
    res.status(500).json({ success: false, message: err.message })
  }
}

export default errorHandler
