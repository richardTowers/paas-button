import { Request, Response, NextFunction } from 'express';

export default async function deploySucceeded(req: Request, res: Response, next: NextFunction): Promise<any> {
  res.render('components/deploy-succeeded/deploy-succeeded.njk')
}
