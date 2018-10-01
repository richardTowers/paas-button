import express from 'express'
import nunjucks from 'nunjucks'
import path from 'path'
import deploy from './components/deploy/deploy'
import passport from 'passport'
import OAuth2Strategy from 'passport-oauth2'

const port = process.env['PORT'] || 8080

const app = express()
nunjucks.configure(['src/', 'node_modules/govuk-frontend'], {express: app})

// TODO error if this isn't set instead of defaulting it
const cloudFoundryAPI = process.env['API_URL'] || 'https://api.towers.dev.cloudpipeline.digital'

// TODO need a cloud foundry client here... copy the one from paas-admin??


const options = {
  authorizationURL: 'TODO',
  clientID:         'TODO',
  clientSecret:     'TODO',
  tokenURL:         'TODO',
}
passport.use(new OAuth2Strategy(
  options,
  (accessToken: string, refreshToken: string, profile: any, cb: any) => cb(null, {accessToken, refreshToken, profile}))
)
app.use(passport.initialize())
app.use(passport.session())
passport.serializeUser((user: {accessToken: string}, cb: (err: any, id?: string) => void) => cb(null, user.accessToken))
passport.deserializeUser((accessToken: string, cb: (err: any, user?: {accessToken: string}) => void) => cb(null, {accessToken}))
app.get('/auth/login', passport.authenticate('oauth2'))
app.get('/auth/login/callback', passport.authenticate('oauth2', {}), (_req, res) => res.redirect('/'))

app.use('/assets', express.static(path.join(__dirname, '../node_modules/govuk-frontend/assets')))
app.use('/styles.css', express.static(path.join(__dirname, 'styles.css')))

app.get('/', (_, res) => res.render('components/home/home.njk'))
app.get('/deploy', deploy)

app.listen(port, () => console.log(`Listening on port ${port}`))