import { GitHubContext } from './context';
import { github } from './github';

const statusContext = 'Tangro CI';

export async function setStatus({
  context,
  step,
  target_url,
  state
}: {
  context: GitHubContext;
  step: string;
  target_url: string;
  state: 'pending' | 'success' | 'failure';
}) {
  const [owner, repo] = context.repository.split('/');

  await github.repos.createStatus({
    context: `${statusContext}/${step}`,
    owner,
    repo,
    sha: context.sha,
    state,
    target_url
  });
}
