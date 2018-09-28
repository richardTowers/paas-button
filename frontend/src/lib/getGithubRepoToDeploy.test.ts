import 'jest'
import getGithubRepoToDeploy from './getGithubRepoToDeploy'

describe('getGithubRepoToDeploy', () => {
  it('handles well formed URLs', () => {
    expect(getGithubRepoToDeploy('https://github.com/alphagov/paas-cf')).toEqual({owner: 'alphagov', repo: 'paas-cf'})
    expect(getGithubRepoToDeploy('github.com/alphagov/paas-cf')).toEqual({owner: 'alphagov', repo: 'paas-cf'})
    expect(getGithubRepoToDeploy('https://github.com/alphagov/paas-cf/tree/master/some-other-file.png')).toEqual({owner: 'alphagov', repo: 'paas-cf'})
  })
  it('returns null for badly formed urls', () => {
    expect(getGithubRepoToDeploy('https://gitlab.com/alphagov/paas-cf')).toBeNull()
    expect(getGithubRepoToDeploy('http://facebook.com/alphagov/paas-cf')).toBeNull()
    expect(getGithubRepoToDeploy('http://4chan.org/a/')).toBeNull()
  })
})
