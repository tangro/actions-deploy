import * as core from '@actions/core';
import fs from 'fs';
import { deployZipFile } from './deploy/deploy';
import { GitHubContext } from './github/context';
import { setStatus } from './github/status';

async function run() {
  try {
    if (
      !process.env.DEPLOY_PASSWORD ||
      process.env.DEPLOY_PASSWORD.length === 0
    ) {
      throw new Error(
        'You have to set the DEPLOY_PASSWORD in your secrets configuration'
      );
    }
    if (!process.env.DEPLOY_USER || process.env.DEPLOY_USER.length === 0) {
      throw new Error(
        'You have to set the DEPLOY_USER in your secrets configuration'
      );
    }

    const context = JSON.parse(
      process.env.GITHUB_CONTEXT || ''
    ) as GitHubContext;
    const [owner, repo] = context.repository.split('/');
    const branch = (context.ref as string).replace('refs/heads/', '');

    const pathToZipFile = core.getInput('zip-file');
    if (!fs.existsSync(pathToZipFile)) {
      throw new Error('The specified zip file does not exist');
    }

    const result = await deployZipFile({
      owner,
      repo,
      project: core.getInput('project'),
      branch,
      pathToZipFile
    });

    const { url } = result.data;

    if (core.getInput('set-status') === 'true') {
      await setStatus({
        context,
        target_url: url,
        state: 'success',
        step: core.getInput('project')
      });
    }
  } catch (error) {
    console.log(error);
    core.setFailed(error.message);
  }
}

run();
