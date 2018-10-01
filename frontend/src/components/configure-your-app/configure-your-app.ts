import { Request, Response, NextFunction } from 'express';
import octokit from '@octokit/rest'

const githubClient = new octokit()

export default function configureYourApp(apiEndpoint: string) {
  return async function configureYourApp(req: Request, res: Response, _next: NextFunction): Promise<any> {
    const repo: {owner: string, repo: string} = req.session && req.session['githubRepo']
    if (!repo) {
      // TODO we can do better than that
      throw new Error('Uh oh - I was expecting to find a githubRepo in session, but I could not find one. Should implement some UI for this.')
    }

    let manifest: string|null = null
    try {
      const githubResponse = await githubClient.repos.getContent({path: 'manifest.yml', ...repo})
      manifest = githubResponse.data
    } catch(err) {
      console.log(`Couldn't find a manifest.yml for repo ${repo.owner}/${repo.repo}, probably because there isn't one`, err.code)
    }
    if (manifest) {
      // TOOD extract any env vars from manifest
    }
    res.render('components/configure-your-app/configure-your-app.njk')
  }
}