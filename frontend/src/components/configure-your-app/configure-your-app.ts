import { Request, Response, NextFunction } from 'express';

export default async function configureYourApp(req: Request, res: Response, next: NextFunction): Promise<any> {
  res.render('components/configure-your-app/configure-your-app.njk')
}
