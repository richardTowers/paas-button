import { Request, Response, NextFunction } from 'express'
    
export default async function signIn(req: Request, res: Response, next: NextFunction): Promise<any> {
  res.render('components/sign-in/sign-in.njk')
}