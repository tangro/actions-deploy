import * as core from '@actions/core';
import axios from 'axios';
import btoa from 'btoa';
import fs from 'fs';
import FormData from 'form-data';

interface ZipFileParameters {
  owner: string;
  repo: string;
  project: string;
  branch: string;
  pathToZipFile: string;
}

export async function deployZipFile({
  owner,
  repo,
  project,
  branch,
  pathToZipFile
}: ZipFileParameters) {
  const url = core.getInput('deploy-url');
  const password = process.env.DEPLOY_PASSWORD as string;
  const user = process.env.DEPLOY_USERNAME as string;

  const formData = new FormData();
  formData.append('owner', owner);
  formData.append('repo', repo);
  formData.append('project', project);
  formData.append('branch', branch);
  formData.append('file', fs.createReadStream(pathToZipFile));

  return axios.post(url, formData, {
    auth: {
      username: user,
      password
    },
    headers: {
      ...formData.getHeaders()
    }
  });
}
