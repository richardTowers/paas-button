import path                 from 'path'
import passport             from 'passport'
import express, { Express, Request, Response, NextFunction } from 'express'

import buttonCallback   from './components/button-callback/button-callback'
import configureYourApp from './components/configure-your-app/configure-your-app'
import home             from './components/home/home'
import signIn           from './components/sign-in/sign-in'
import DeployYourApp    from './components/deploy-your-app/deploy-your-app'
import deploySucceeded  from './components/deploy-succeeded/deploy-succeeded'
import deployFailed     from './components/deploy-failed/deploy-failed';
import ChooseASpace     from './components/choose-a-space/choose-a-space';
import error            from './components/error/error'

function handleError(routeHandler: (req: Request, res: Response, next: NextFunction) => void): (req: Request, res: Response, next: NextFunction) => void {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      routeHandler(req, res, next)
    } catch(err) {
      console.log('Error caught by router', err)
      res.redirect('/error')
    }
  }
}
function handleRejection(routeHandler: (req: Request, res: Response, next: NextFunction) => Promise<any>): (req: Request, res: Response, next: NextFunction) => void {
  return (req: Request, res: Response, next: NextFunction) => {
    routeHandler(req, res, next).then(() => next()).catch(err => {
      console.log('Rejection caught by router', err)
      res.redirect('/error')
    })
  }
}
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
  app.get('/button-callback', (req, res, next) => {
    buttonCallback(req, res, next).then(() => next()).catch(x => next(x))
  })
  const chooseASpace = new ChooseASpace(apiEndpoint)
  app.get('/choose-a-space', handleRejection(chooseASpace.chooseASpace.bind(chooseASpace)))
  app.get('/configure-your-app', handleError(configureYourApp))
  app.get('/sign-in', handleError(signIn))
  app.get('/deploy-succeeded', handleError(deploySucceeded))
  app.get('/deploy-failed', handleError(deployFailed))

  const deployYourApp = new DeployYourApp(
    serviceUserUsername, 
    serviceUserPassword,
    apiEndpoint,
    paasButtonBackendGuid,
  )
  app.post('/deploy-your-app', handleRejection(deployYourApp.deployYourAppSubmit.bind(deployYourApp)))
  app.get('/deploy-your-app', handleRejection(deployYourApp.deployYourAppStatus.bind(deployYourApp)))
  app.get('/sign-out', (req, res) => {
    req.session = undefined
    // TODO don't hardcode this
    res.redirect('https://login.towers.dev.cloudpipeline.digital/logout.do')
  })
  app.get('/error', error)
}
