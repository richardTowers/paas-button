import { Request, Response, NextFunction } from 'express';

export default function deploySucceeded(req: Request, res: Response, next: NextFunction): void {
  try {
    if (!req.session) { throw new Error('Session required') }
    if (!req.user) { throw new Error('User required') }

    const githubRepo: {owner: string, repo: string} = req.session['githubRepo']
    if (!githubRepo) { throw new Error('Session should contain a github repo') }

    const route = req.session['route']
    // TODO don't hardcode the domain
    const url = `https://${route}.towers.dev.cloudpipelineapps.digital`
    res.render('components/deploy-succeeded/deploy-succeeded.njk', {url, hasSession: !!req.user})
  } catch (err) {
    console.error('deploySucceeded', err)
    res.redirect('/error')
  }
}

