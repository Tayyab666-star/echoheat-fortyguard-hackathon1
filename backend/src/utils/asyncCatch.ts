import type { Request, Response, NextFunction, RequestHandler } from "express"

type AsyncHandler = (req: Request, res: Response, next: NextFunction) => Promise<void>

export const asyncCatch = (fn: AsyncHandler): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next)
  }
}
