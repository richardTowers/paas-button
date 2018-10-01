import { Request, Response, NextFunction } from 'express'
import getGithubRepoToDeploy from '../../lib/getGithubRepoToDeploy'
import octokit from '@octokit/rest'

const githubClient = new octokit();
    
export default async function deploy(req: Request, res: Response, next: NextFunction): Promise<any> {
  const githubRepo = getGithubRepoToDeploy(req.query.url || req.headers['referer'])
  if (!githubRepo) {
    return res.redirect('/?error=no-url')
  }
  const repo = await githubClient.repos.get(githubRepo)
  if (repo.status === 200) {
    const description = repo.data.description
    return res.render('components/deploy/deploy.njk', { urlToDeploy: `${githubRepo.owner}/${githubRepo.repo}`, description })
  } else {
    return res.redirect('/?error=repo-not-found')
  }
}