import express from 'express'
import nunjucks from 'nunjucks'
import path from 'path'
import deploy from './components/deploy/deploy'
import passport from 'passport'
import { Strategy } from 'passport-oauth2'
import CloudFoundryClient from './lib/cf'
import cookieSession from 'cookie-session'

function ensureEnvironmentVariable(name: string) {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Environment variable ${name} must be set`)
  }
  return value
}
async function main() {
  const port = process.env['PORT'] || 8080

  const app = express()
  nunjucks.configure(['src/', 'node_modules/govuk-frontend'], {express: app})

  const apiEndpoint = ensureEnvironmentVariable('API_URL')
  const cloudFoundryClient = new CloudFoundryClient({apiEndpoint})
  const info = await cloudFoundryClient.info()
  const authorizationEndpoint = info.authorization_endpoint
  const uaaEndpoint = info.token_endpoint

  const options = {
    authorizationURL: `${authorizationEndpoint}/oauth/authorize`,
    clientID:         'paas-button',
    clientSecret:     ensureEnvironmentVariable('PAAS_BUTTON_UAA_SECRET'),
    tokenURL:         `${uaaEndpoint}/oauth/token`,
  }
  app.use(cookieSession({
    name: 'paas-button-session',
    keys: [ensureEnvironmentVariable('COOKIE_SECRET')],
    secure: ensureEnvironmentVariable('COOKIE_INSECURE') !== 'true',
    httpOnly: true,
  }))

  passport.use(new Strategy(
    options,
    function (accessToken: string, refreshToken: string, profile: any, cb: any) {
      if (!accessToken) { throw new Error('Access token was empty - have you got your OAuth provider set up correctly?') }
      cb(null, {accessToken, refreshToken, profile})
    })
  )
  app.use(passport.initialize())
  app.use(passport.session())
  passport.serializeUser((user: {accessToken: string}, cb: (err: any, id?: string) => void) => {
    cb(null, user.accessToken)
  })
  passport.deserializeUser((accessToken: string, cb: (err: any, user?: {accessToken: string}) => void) => {
    cb(null, {accessToken})
  })
  app.get('/auth/login', passport.authenticate('oauth2'))
  app.get('/auth/login/callback', passport.authenticate('oauth2', {}), (_req, res) => res.redirect('/'))

  app.use('/assets', express.static(path.join(__dirname, '../node_modules/govuk-frontend/assets')))
  app.use('/styles.css', express.static(path.join(__dirname, 'styles.css')))

  app.get('/', (_, res) => res.render('components/home/home.njk'))
  app.get('/deploy', deploy)

  return app.listen(port, () => console.log(`Listening on port ${port}`))
}

main()
  .then(() => console.log('Shutdown gracefully'))
  .catch(err => console.error('Shutdown with an error', err))
