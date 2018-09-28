/**
 * Sanitizes raw user input into a supported URL (GitHub only for now)
 * 
 * @param rawInput raw user input (either from the referer header or the path)
 * @returns a string of the form "organisation/repository"
 */
export default function getGithubRepoToDeploy(rawInput: string): {owner:string,repo:string}|null {
  const pattern = /^(?:https:\/\/)?github.com\/([^\/]+)\/([^\/]+)/
  const result = pattern.exec(rawInput)
  if (result === null) {
    return null
  }
  return {
    owner: result[1],
    repo: result[2],
  }
}
