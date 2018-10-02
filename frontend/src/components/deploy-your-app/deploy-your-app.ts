import { Request, Response, NextFunction } from 'express';
import CloudFoundryClient from '../../lib/cf/cf'
import { authenticateUser } from '../../lib/uaa'

export default class DeployYourApp {
  constructor(
    private serviceUserUsername: string,
    private serviceUserPassword: string,
    private apiEndpoint: string,
    private paasButtonBackendGuid: string) { }

  public deployYourAppStatus(req: Request, res: Response, next: NextFunction): void {
    return res.render('components/deploy-your-app/deploy-your-app.njk')
  }

  public async deployYourAppSubmit(req: Request, res: Response, next: NextFunction): Promise<any> {
    if (!req.user) {
      throw new Error('User required')
    }
    const info = await new CloudFoundryClient({apiEndpoint: this.apiEndpoint}).info()
    const accessToken        = await authenticateUser(info.authorization_endpoint, {username: this.serviceUserUsername, password: this.serviceUserPassword})
    const cloudFoundryClient = new CloudFoundryClient({apiEndpoint: this.apiEndpoint, accessToken: accessToken})

    // TODO: don't hardcode these things!
    const command = `./push-from-url.rb '${req.user['accessToken']}' '${req.user['refreshToken']}' admin paas-button paas-button-example https://github.com/richardTowers/paas-button-example/archive/master.zip`
    const result  = await cloudFoundryClient.runTask(this.paasButtonBackendGuid, command)

    // TODO handle result
    console.log(result)
    
    // TODO get app logs

    return res.redirect('/deploy-your-app')
  }
}
