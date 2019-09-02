# actions-deploy

An action to deploy a previously zipped static site to the tangro static file server. The action receives a static site contained in a zip file and automatically deploys the contents under `https://$url/$owner/$repo/$step/$context`

# Example workflow

```yml
name: Run CI

on: [push]

jobs:
  coverage:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout latest code
        uses: actions/checkout@v1
      - name: Use Node.js 12.x
        uses: actions/setup-node@v1
        with:
          node-version: 12.x
      - name: Run npm install
        run: npm install
      - name: Collect Coverage
        uses: tangro/actions-coverage@0.0.1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          GITHUB_CONTEXT: ${{ toJson(github) }}
      - name: Zip coverage results
        run: |
          cd coverage
          cd lcov-report
          zip --quiet --recurse-paths ../../coverage.zip *
      - name: Deploy coverage
        uses: tangro/actions-deploy@1.0.0
        with:
          context: branch
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

Steps

1. Checkout the latest code
2. Using node
3. Run npm install
4. Collect the coverage (using jest)
5. Zip the report
6. Call our deploy action

# How To Use

You have to have the thing ready inside a `.zip` file you want to deploy to the static server. In our example above it was the coverage report created by jest.

The resulting URL is `https://$URL/$owner/$repo/$project/$context`
You can have several deploys per project and several project per repo. And several repos per owner. And several owners.

## Input variables

- `zip-file` The name (and the path) of the `.zip` file you want to deploy. It's recommended to put the zip file to and serve it from the home directory
- `project` The project/step you want to deploy. To have several static sites per repo. Because the URL structure is `https://$URL/$owner/$repo/$project/$context`. In our example it is the `coverage`. It could also for example be the `styleguide` or the `build` (if the built page is a static site)
- `context` The `'branch'` or `'sha'`. It's recommende to use the `'sha'` when pushing code to `master` or `develop` and use `'branch'` when pushing to a Pull Request. When using the same context for two deploys, only the newest will be deployed. The old one will be replaced and deleted. So when you want to bind the deploy to a commit SHA use `'sha'` as `context`

## Environment variables

We need several environment variables to be able to deploy.

- `GITHUB_TOKEN` To be able to set the status
- `GITHUB_CONTEXT`
- `DEPLOY_PASSWORD` The password for the `/deploy` route on the tangro static server
- `DEPLOY_USER` The username of the user for the `/deploy` route
