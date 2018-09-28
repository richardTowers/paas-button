import express from 'express'
import nunjucks from 'nunjucks'
import path from 'path'

const port = process.env['PORT'] || 8080

const app = express()
nunjucks.configure(['src/', 'node_modules/govuk-frontend'], {express: app})

app.use('/assets', express.static(path.join(__dirname, '../node_modules/govuk-frontend/assets')))
app.use('/styles.css', express.static(path.join(__dirname, 'styles.css')))

app.get('/', (_, res) => res.render('components/home/home.njk'))
app.get('/deploy', (req, res) => {
  // TODO: extract this into a nice testable function
  const urlToDeploy = req.query.url || req.headers['referer']
  if (!urlToDeploy) {
    res.redirect('/?error=no-url')
  }
  res.render('components/deploy/deploy.njk', { urlToDeploy })
})

app.listen(port, () => console.log(`Listening on port ${port}`))