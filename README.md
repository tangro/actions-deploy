# tangro/actions-deploy

An action to deploy a previously zipped static site to the tangro static file server. The action receives a static site contained in a zip file and automatically deploys the contents under `https://$url/$owner/$repo/$step/$context`

# Choose a version

You can use a specific `version` of this action. The latest published version is `v1.2.13`. You can also use `latest` to always get the latest version.

# Example workflow

```yml
name: Run CI

on: [push]

jobs:
  coverage:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout latest code
        uses: actions/checkout@v3
      - name: Use Node.js 16.x
        uses: actions/setup-node@v3.5.1
        with:
          node-version: 16.x
      - name: Run npm install
        run: npm install
      - name: Collect Coverage
        uses: 
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          GITHUB_CONTEXT: ${{ toJson(github) }}
      - name: Zip coverage results
        run: |
          cd coverage
          cd lcov-report
          zip --quiet --recurse-paths ../../coverage.zip *
      - name: Deploy coverage
        uses: tangro/actions-deploy@v1.2.13
        with:
          context: auto
          zip-file: coverage.zip
          deploy-url: $URL
          project: coverage
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          GITHUB_CONTEXT: ${{ toJson(github) }}
          DEPLOY_PASSWORD: ${{ secrets.DEPLOY_PASSWORD }}
          DEPLOY_USER: ${{ secrets.DEPLOY_USER }}
```

> **Attention** You have to replace \$URL with the deploy URL of your tangro-static file server instance

Steps the action in the example will perform

1. Checkout the latest code
2. Using node
3. Run npm install
4. Collect the coverage (using jest)
5. Zip the report
6. Call the deploy action

# How To Use

You have to have the site you want to deploy ready inside a `.zip`. In our example above it was the coverage report created by jest.

The resulting URL will be `https://$URL/$owner/$repo/$project/$context`

You can have:

- several deploys per project
- several projects per repo
- several repos per owner
- several owners

## Input variables

- `zip-file`: The name (and the path) of the `.zip` file you want to deploy. It's recommended to put the zip file to and serve it from the home directory
- `project`: The project/step you want to deploy. To have several static sites per repo. Because the URL structure is `https://$URL/$owner/$repo/$project/$context`. In our example it is the `coverage`. It could also for example be the `styleguide` or the `build` (if the built page is a static site)
- `context`: Either `'branch'`, `'sha'` or `'auto'`. When using `'branch'` the branch name will be used for the context. When you push into an existing branch the old deploy will be replaced with the new one. When using `'sha'` every deploy will be unique since it uses the commit `SHA`. By using `'auto'` it will deploy a new site when a push is made into `develop` or `master` and otherwise will use the branch name. Default is `'branch'`
- `set-status`: Set to `false` to do not set a status to the commit. Default `true`

## Output variables

- `deployed-url`: The URL for the newly deployed site

## Environment variables

We need several environment variables to be able to deploy.

- `GITHUB_TOKEN` To be able to set the status
- `GITHUB_CONTEXT`
- `DEPLOY_PASSWORD` The password for the `/deploy` route on the tangro static server
- `DEPLOY_USER` The username of the user for the `/deploy` route

# Development

Follow the guide on the `tangro-action-template` repository.
