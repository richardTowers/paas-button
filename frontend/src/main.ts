import express from 'express'
import nunjucks from 'nunjucks'
import path from 'path'

const port = process.env['PORT'] || 8080

const app = express()
nunjucks.configure(['src/', 'node_modules/govuk-frontend'], {express: app})

app.use('/assets', express.static(path.join(__dirname, '../node_modules/govuk-frontend/assets')))
app.use('/styles.css', express.static(path.join(__dirname, 'styles.css')))

app.get('/', (req, res, next) => {
  res.render('components/deploy/deploy.njk')
})

app.listen(port, () => console.log(`Listening on port ${port}`))