import express from 'express'
import nunjucks from 'nunjucks'
import path from 'path'
import deploy from './components/deploy/deploy'

const port = process.env['PORT'] || 8080

const app = express()
nunjucks.configure(['src/', 'node_modules/govuk-frontend'], {express: app})

app.use('/assets', express.static(path.join(__dirname, '../node_modules/govuk-frontend/assets')))
app.use('/styles.css', express.static(path.join(__dirname, 'styles.css')))

app.get('/', (_, res) => res.render('components/home/home.njk'))
app.get('/deploy', deploy)

app.listen(port, () => console.log(`Listening on port ${port}`))