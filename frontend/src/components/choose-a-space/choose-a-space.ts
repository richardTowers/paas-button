import { Request, Response, NextFunction } from 'express';
import CloudFoundryClient from '../../lib/cf/cf'

export default function chooseASpace(apiEndpoint: string) {
  return async function chooseASpace(req: Request, res: Response, next: NextFunction): Promise<any> {
    if (!req.session) { throw new Error('Session required') }
    const githubRepo = req.session['githubRepo']
    if (!githubRepo) { throw new Error('Expected a github repo') }

    const cloudFoundryClient = new CloudFoundryClient({
      apiEndpoint,
      accessToken: req.user.accessToken,
    })
    const orgs = await cloudFoundryClient.organizations()
    const orgsAndSpaces = await Promise.all(orgs.map(async o => ({
      orgName: o.entity.name,
      orgGuid: o.metadata.guid,
      spaces: await cloudFoundryClient.spaces(o.metadata.guid).then(ss => ss.map(s => ({spaceName: s.entity.name, spaceGuid: s.metadata.guid})))
    })))
    console.log(orgsAndSpaces)
    res.render('components/choose-a-space/choose-a-space.njk', {githubRepo})
  }
}
