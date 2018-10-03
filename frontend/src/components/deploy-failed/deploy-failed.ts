import { Request, Response, NextFunction } from 'express';

export default function deployFailed(req: Request, res: Response, next: NextFunction): void {
  res.render('components/deploy-failed/deploy-failed.njk')
}

