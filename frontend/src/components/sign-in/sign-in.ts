import { Request, Response, NextFunction } from 'express'
    
export default async function signIn(req: Request, res: Response, next: NextFunction): Promise<any> {
  if (!req.session) { throw new Error('Session required') }
  const githubRepo = req.session['githubRepo']
  if (!githubRepo) { throw new Error('Expected a github repo') }
  
  res.render('components/sign-in/sign-in.njk', {githubRepo})
}