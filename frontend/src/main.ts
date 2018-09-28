import express from 'express'
import nunjucks from 'nunjucks'
import path from 'path'
import octokit from '@octokit/rest'
import getGithubRepoToDeploy from './lib/getGithubRepoToDeploy'

const port = process.env['PORT'] || 8080
const githubClient = new octokit();

const app = express()
nunjucks.configure(['src/', 'node_modules/govuk-frontend'], {express: app})

app.use('/assets', express.static(path.join(__dirname, '../node_modules/govuk-frontend/assets')))
app.use('/styles.css', express.static(path.join(__dirname, 'styles.css')))

app.get('/', (_, res) => res.render('components/home/home.njk'))
app.get('/deploy', async (req, res) => {
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

})

app.listen(port, () => console.log(`Listening on port ${port}`))