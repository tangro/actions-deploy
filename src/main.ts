import * as core from '@actions/core';
import fs from 'fs';
import { deployZipFile } from './deploy/deploy';
import {
  GitHubContext,
  setStatus,
  getStatus,
  createSuccessfulDeployment
} from '@tangro/tangro-github-toolkit';

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

    const deployContextInput = core.getInput('context');
    if (
      deployContextInput !== 'branch' &&
      deployContextInput !== 'sha' &&
      deployContextInput !== 'auto'
    ) {
      throw new Error(
        `The deploy context has to be either "branch", "sha" or "auto". But was "${deployContextInput}"`
      );
    }

    const context = JSON.parse(
      process.env.GITHUB_CONTEXT || ''
    ) as GitHubContext<{}>;
    const [owner, repo] = context.repository.split('/');

    const branch = (context.ref as string).replace('refs/heads/', '');

    let deployContext = branch;

    if (deployContextInput === 'sha') {
      deployContext = context.sha;
    } else if (
      deployContextInput === 'auto' &&
      (branch === 'develop' || branch === 'master')
    ) {
      deployContext = context.sha;
    } else {
      deployContext = branch;
    }

    core.debug(`Using branch: ${context.sha}`);
    const project = core.getInput('project');

    const pathToZipFile = core.getInput('zip-file');
    if (!fs.existsSync(pathToZipFile)) {
      throw new Error('The specified zip file does not exist');
    }

    const result = await deployZipFile({
      owner,
      repo,
      project,
      branch: deployContext,
      pathToZipFile
    });

    const { url } = result.data;
    if (core.getInput('set-status') === 'true') {
      const previousStatus = await getStatus({
        context,
        step: project
      });

      await setStatus({
        context,
        description: previousStatus ? previousStatus.description : undefined,
        target_url: url,
        state: previousStatus
          ? (previousStatus.state as 'success' | 'pending' | 'failure')
          : 'success',
        step: project
      });
    }
    if (core.getInput('create-deployment') === 'true') {
      await createSuccessfulDeployment({
        context,
        url,
        environment: project,
        description: project
      });
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
