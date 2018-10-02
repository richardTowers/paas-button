import { Request, Response, NextFunction } from 'express';
import CloudFoundryClient from '../../lib/cf/cf'
import { authenticateUser } from '../../lib/uaa'

export default class DeployYourApp {
  constructor(
    private serviceUserUsername: string,
    private serviceUserPassword: string,
    private apiEndpoint: string,
    private paasButtonBackendGuid: string) { }

  public async deployYourAppStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    if (!req.session) { throw new Error('Session required') }
    if (!req.user) { throw new Error('User required') }
    const cloudFoundryClient = await this.getCloudFoundryClient()

    const taskGUID: string = req.session['taskGUID']
    if (!taskGUID) { throw new Error('taskGUID should be in session') }

    const task = await cloudFoundryClient.getTask(taskGUID)

    switch(task.state) {
      case 'RUNNING':
        // TODO get task logs
        return res.render('components/deploy-your-app/deploy-your-app.njk')
      case 'SUCCEEDED':
        return res.redirect('/deploy-succeeded')
      case 'FAILED':
        return res.redirect('/deploy-failed')
      default:
        throw new Error(`Unexpected state ${task.state}`)
    }
  }

  public async deployYourAppSubmit(req: Request, res: Response, next: NextFunction): Promise<any> {
    if (!req.session) { throw new Error('Session required') }
    if (!req.user) { throw new Error('User required') }
    const cloudFoundryClient = await this.getCloudFoundryClient()

    // TODO: don't hardcode these things!
    const command = `./push-from-url.rb '${req.user['accessToken']}' '${req.user['refreshToken']}' admin paas-button paas-button-example https://github.com/richardTowers/paas-button-example/archive/master.zip`

    const result  = await cloudFoundryClient.runTask(this.paasButtonBackendGuid, command)
    req.session['taskGUID'] = result.guid
    return res.redirect('/deploy-your-app')
  }

  private async getCloudFoundryClient(): Promise<CloudFoundryClient> {
    const info = await new CloudFoundryClient({apiEndpoint: this.apiEndpoint}).info()
    const accessToken        = await authenticateUser(info.authorization_endpoint, {username: this.serviceUserUsername, password: this.serviceUserPassword})
    return new CloudFoundryClient({apiEndpoint: this.apiEndpoint, accessToken: accessToken})
  }
}
