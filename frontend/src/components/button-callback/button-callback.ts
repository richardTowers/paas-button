import { Request, Response, NextFunction } from 'express';

import getGithubRepoToDeploy from '../../lib/getGithubRepoToDeploy'

export default async function buttonCallback(req: Request, res: Response, next: NextFunction): Promise<any> {
  if (!req.session) { throw new Error('Session required') }

  const githubRepo = getGithubRepoToDeploy(req.query.url || req.headers['referer'])
  if (!githubRepo) {
    return res.redirect('/?error=no-url')
  }
  req.session['githubRepo'] = githubRepo

  if (!req.user) {
      // when the user is not signed in
      return res.redirect('/sign-in')
  }

  // TODO use CloudFoundryClient to get a list of orgs and spaces and redirect if needed
  return res.redirect('/configure-your-app')
}



