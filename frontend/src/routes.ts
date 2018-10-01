import path                 from 'path'
import passport             from 'passport'
import express, { Express } from 'express'

import buttonCallback   from './components/button-callback/button-callback'
import chooseASpace     from './components/choose-a-space/choose-a-space'
import configureYourApp from './components/configure-your-app/configure-your-app'
import home             from './components/home/home'
import signIn           from './components/sign-in/sign-in'

export default function configureRoutes(app: Express) {
  app.get('/auth/login', passport.authenticate('oauth2'))
  app.get('/auth/login/callback', passport.authenticate('oauth2', {}), (_req, res) => {
    // TODO might need to got to select a space first...
    res.redirect('/configure-your-app')
  })

  app.use('/assets', express.static(path.join(__dirname, '../node_modules/govuk-frontend/assets')))
  app.use('/styles.css', express.static(path.join(__dirname, 'styles.css')))

  app.get('/', home)
  app.get('/button-callback', buttonCallback)
  app.get('/choose-a-space', chooseASpace)
  app.get('/configure-your-app', configureYourApp)
  app.get('/sign-in', signIn)
}
