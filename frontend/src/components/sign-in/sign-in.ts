import { Request, Response, NextFunction } from 'express'
    
export default function signIn(req: Request, res: Response, next: NextFunction): void {
  try {
    if (!req.session) { throw new Error('Session required') }
    const githubRepo = req.session['githubRepo']
    if (!githubRepo) { throw new Error('Expected a github repo') }
    
    res.render('components/sign-in/sign-in.njk', {githubRepo, hasSession: !!req.user})
  } catch (err) {
    console.error(err)
    res.redirect('/error')
  }
}