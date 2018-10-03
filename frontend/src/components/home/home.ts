import { Request, Response, NextFunction } from 'express';

export default async function home(req: Request, res: Response, next: NextFunction): Promise<any> {
  res.render('components/home/home.njk', {hasSession: !!req.user})
}
