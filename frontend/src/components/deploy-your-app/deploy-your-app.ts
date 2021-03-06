import { Request, Response, NextFunction } from 'express';
import CloudFoundryClient from '../../lib/cf/cf'
import { authenticateUser } from '../../lib/uaa'
import { check, validationResult } from 'express-validator/check'

export default class DeployYourApp {
  constructor(
    private serviceUserUsername: string,
    private serviceUserPassword: string,
    private apiEndpoint: string,
    private paasButtonBackendGuid: string) { }

  public async deployYourAppStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.session) { throw new Error('Session required') }
      if (!req.user) { throw new Error('User required') }
      const githubRepo = req.session['githubRepo']
      if (!githubRepo) { throw new Error('Expected a github repo') }
      const cloudFoundryClient = await this.getCloudFoundryClient()

      const taskGUID: string = req.session['taskGUID']
      if (!taskGUID) { throw new Error('taskGUID should be in session') }

      const task = await cloudFoundryClient.getTask(taskGUID)

      switch(task.state) {
        case 'RUNNING':
          // TODO get task logs
          return res.render('components/deploy-your-app/deploy-your-app.njk', {githubRepo, hasSession: !!req.user})
        case 'SUCCEEDED':
          return res.redirect('/deploy-succeeded')
        case 'FAILED':
          return res.redirect('/deploy-failed')
        default:
          throw new Error(`Unexpected state ${task.state}`)
      }
    } catch (err) {
      console.error('deployYourAppStatus', err)
      res.redirect('/error')
    }
  }

  public readonly deployYourAppSubmitMiddleware = [
    check('app-name').isLength({min: 4}).matches(/^[a-z0-9][a-z0-9\-]+$/),
    check('route').isLength({min: 4}).matches(/^[a-z0-9][a-z0-9\-]+$/)
  ]
  public async deployYourAppSubmit(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      if (!req.session) { throw new Error('Session required') }
      if (!req.user) { throw new Error('User required') }

      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        req.session['validationErrors'] = errors.mapped()
        return res.redirect('/configure-your-app?validation-error=true')
      }
      const githubRepo: {owner: string, repo: string} = req.session['githubRepo']
      if (!githubRepo) { throw new Error('Session should contain a github repo') }

      // TODO: get this URL from the github API instead of templating it:
      const zipFileToDeploy = `https://github.com/${githubRepo.owner}/${githubRepo.repo}/archive/master.zip`

      const appName = req.body['app-name']
      const route = req.body['route']
      req.session['route'] = route

      // TODO: don't hardcode org, space
      const command = `./push-from-url.rb '${req.user['accessToken']}' '${req.user['refreshToken']}' admin paas-button '${appName}' '${zipFileToDeploy}' --hostname '${route}'`

      const cloudFoundryClient = await this.getCloudFoundryClient()
      const result  = await cloudFoundryClient.runTask(this.paasButtonBackendGuid, command)
      req.session['taskGUID'] = result.guid
      return res.redirect('/deploy-your-app')
    } catch (err) {
      console.log('deployYourAppSubmit', err)
      res.redirect('/error')
    }
  }

  private async getCloudFoundryClient(): Promise<CloudFoundryClient> {
    const info = await new CloudFoundryClient({apiEndpoint: this.apiEndpoint}).info()
    const accessToken        = await authenticateUser(info.authorization_endpoint, {username: this.serviceUserUsername, password: this.serviceUserPassword})
    return new CloudFoundryClient({apiEndpoint: this.apiEndpoint, accessToken: accessToken})
  }
}
