# create-rwjblue-release-it-setup

Simple npm init / yarn create bin package to add release-it setup used by rwjblue.

This will do the following:

* add `release-it` config to the `package.json`
* install required dependencies,
* add a `CHANGELOG.md`
* add a `RELEASE.md`
* update your repositories labels with my "go to" defaults

## Usage

### Prerequisites

1. Obtain a [GitHub personal access token][generate-token].
2. Make sure the token is available as the `GITHUB_AUTH` environment variable.
  For instance:
  ```bash
  export GITHUB_AUTH=abc123def456
  ```

[generate-token]: https://github.com/settings/tokens/new?scopes=repo&description=GITHUB_AUTH+env+variable

### Freshly Configuring a Repo

When you want to set up a repo with `release-it`, you can run:

```
# in a yarn repo
yarn create rwjblue-release-it-setup

# in an npm repo
npm init rwjblue-release-it-setup
```

### Updating an Already Configured Repo

If you'd like to update an existing repo to use the latest and greatest setup, you can run:

```
# in a yarn repo
yarn create rwjblue-release-it-setup --update

# in an npm repo
npm init rwjblue-release-it-setup --update
```

### Only Sync Labels

If you'd like to run only the label sync, you can do that with:

```
# in a yarn repo
yarn create rwjblue-release-it-setup --labels-only

# in an npm repo
npm init rwjblue-release-it-setup --labels-only
```

## License

This project is licensed under the [MIT License](LICENSE.md).
