import { Request, Response, NextFunction } from 'express';

export async function deployYourAppStatus(req: Request, res: Response, next: NextFunction): Promise<any> {
  return res.render('components/deploy-your-app/deploy-your-app.njk')
}

export async function deployYourAppSubmit(req: Request, res: Response, next: NextFunction): Promise<any> {
  // TODO - kick off the deployment before redirecting
  return res.redirect('/deploy-your-app')
}
