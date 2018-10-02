import { Request, Response, NextFunction } from 'express';

export default async function deployFailed(req: Request, res: Response, next: NextFunction): Promise<any> {
  res.render('components/deploy-failed/deploy-failed.njk')
}

