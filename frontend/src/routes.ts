import path                 from 'path'
import passport             from 'passport'
import express, { Express } from 'express'

import buttonCallback   from './components/button-callback/button-callback'
import chooseASpace     from './components/choose-a-space/choose-a-space'
import configureYourApp from './components/configure-your-app/configure-your-app'
import home             from './components/home/home'
import signIn           from './components/sign-in/sign-in'
import DeployYourApp    from './components/deploy-your-app/deploy-your-app'
import deploySucceeded  from './components/deploy-succeeded/deploy-succeeded'
import deployFailed     from './components/deploy-failed/deploy-failed';

export default function configureRoutes(
    app: Express,
    serviceUserUsername: string,
    serviceUserPassword: string,
    apiEndpoint: string,
    paasButtonBackendGuid: string) {

  app.get('/auth/login', passport.authenticate('oauth2'))
  app.get('/auth/login/callback', passport.authenticate('oauth2', {}), (_req, res) => {
    // TODO might need to got to select a space first...
    res.redirect('/configure-your-app')
  })

  app.use('/assets', express.static(path.join(__dirname, '../node_modules/govuk-frontend/assets')))
  app.use('/styles.css', express.static(path.join(__dirname, 'styles.css')))
  app.use('/loading-spinner.gif', express.static(path.join(__dirname, 'loading-spinner.gif')))
  app.use('/paas-button.png', express.static(path.join(__dirname, 'paas-button.png')))

  app.get('/', home)
  app.get('/button-callback', buttonCallback)
  app.get('/choose-a-space', chooseASpace(apiEndpoint))
  app.get('/configure-your-app', configureYourApp(apiEndpoint))
  app.get('/sign-in', signIn)
  app.get('/deploy-succeeded', deploySucceeded)
  app.get('/deploy-failed', deployFailed)

  const deployYourApp = new DeployYourApp(
    serviceUserUsername, 
    serviceUserPassword,
    apiEndpoint,
    paasButtonBackendGuid,
  )
  app.post('/deploy-your-app', deployYourApp.deployYourAppSubmit.bind(deployYourApp))
  app.get('/deploy-your-app', deployYourApp.deployYourAppStatus.bind(deployYourApp))
  app.get('/logout', (req, res) => {
    req.session = undefined
    // TODO don't hardcode this
    res.redirect('https://login.towers.dev.cloudpipeline.digital/logout.do')
  })
}
