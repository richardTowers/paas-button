import { Request, Response, NextFunction } from 'express';

export default async function error(req: Request, res: Response, next: NextFunction): Promise<any> {
  res.render('components/error/error.njk', {hasSession: !!req.user})
}
