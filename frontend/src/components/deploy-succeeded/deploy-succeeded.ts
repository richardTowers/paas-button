import { Request, Response, NextFunction } from 'express';

export default async function deploySucceeded(req: Request, res: Response, next: NextFunction): Promise<any> {
  if (!req.session) { throw new Error('Session required') }
  if (!req.user) { throw new Error('User required') }

  const githubRepo: {owner: string, repo: string} = req.session['githubRepo']
  if (!githubRepo) { throw new Error('Session should contain a github repo') }

  // TODO: This won't be correct if the user specifies a name
  const url = `https://${githubRepo.repo}.towers.dev.cloudpipelineapps.digital`
  res.render('components/deploy-succeeded/deploy-succeeded.njk', {url})
}

