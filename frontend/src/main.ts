import express from 'express'
import nunjucks from 'nunjucks'
import passport from 'passport'
import { Strategy } from 'passport-oauth2'
import CloudFoundryClient from './lib/cf'
import cookieSession from 'cookie-session'
import configureRoutes from './routes'

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
  passport.serializeUser((user: {accessToken: string, refreshToken: string}, cb: (err: any, id?: string) => void) => {
    cb(null, JSON.stringify({accessToken: user.accessToken, refreshToken: user.refreshToken}))
  })
  passport.deserializeUser((serializedUser: string, cb: (err: any, user?: {accessToken: string, refreshToken: string}) => void) => {
    const user = JSON.parse(serializedUser)
    cb(null, user)
  })

  configureRoutes(
    app,
    ensureEnvironmentVariable('CF_SERVICE_USER_USERNAME'),
    ensureEnvironmentVariable('CF_SERVICE_USER_PASSWORD'),
    apiEndpoint,
    ensureEnvironmentVariable('PAAS_BUTTON_BACKEND_APP_GUID'),
  )

  app.listen(port, () => console.log(`Listening on port ${port}`))
}

main()