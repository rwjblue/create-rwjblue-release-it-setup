#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const util = require('util');
const execa = require('execa');
const sortPackageJson = require('sort-package-json');
const getRepoInfoFromURL = require('hosted-git-info').fromUrl;
const gitconfig = util.promisify(require('gitconfiglocal'));
const semver = require('semver');
const which = require('which');

const skipInstall = process.argv.includes('--no-install');
const skipLabels = process.argv.includes('--no-label-updates');
const labelsOnly = process.argv.includes('--labels-only');
const update = process.argv.includes('--update');

const RELEASE_IT_VERSION = (() => {
  let pkg = require('../package');

  return pkg.devDependencies['release-it'];
})();

const RELEASE_IT_LERNA_CHANGELOG_VERSION = (() => {
  let pkg = require('../package');

  return pkg.devDependencies['release-it-lerna-changelog'];
})();

const RELEASE_IT_YARN_WORKSPACES_VERSION = (() => {
  let pkg = require('../package');

  return pkg.devDependencies['release-it-yarn-workspaces'];
})();

const DETECT_TRAILING_WHITESPACE = /\s+$/;

function hasEditor() {
  let EDITOR = process.env.EDITOR;

  if (!EDITOR) {
    EDITOR = which.sync('editor', { nothrow: true });
  }

  return !!EDITOR;
}

function getDependencyRange(theirs, ours) {
  if (theirs) {
    let ourRange = new semver.Range(ours);
    let ourMinimumVersion = ourRange.set[0][0].semver.version;

    let theirMinimumVersion;
    try {
      let theirRange = new semver.Range(theirs);
      theirMinimumVersion = theirRange.set[0][0].semver.version;
    } catch (error) {
      // handle github:foo/a#bar
      if (error.message.startsWith('Invalid comparator')) {
        // if it is invalid, but not missing, theirs should be preserved
        return theirs;
      } else {
        throw error;
      }
    }

    // pre-existing version is newer, do nothing
    if (semver.gt(theirMinimumVersion, ourMinimumVersion)) {
      return theirs;
    }
  }

  return ours;
}

async function updatePackageJSON() {
  let contents = fs.readFileSync('package.json', { encoding: 'utf8' });
  let trailingWhitespace = DETECT_TRAILING_WHITESPACE.exec(contents);
  let pkg = JSON.parse(contents);
  let hasWorkspaces = !!pkg.workspaces;

  if (labelsOnly) {
    return pkg;
  }

  if (!findRepoURL(pkg)) {
    try {
      let config = await gitconfig(process.cwd());
      let originRemoteUrl = config.remote && config.remote.origin && config.remote.origin.url;

      if (originRemoteUrl) {
        pkg.repository = {
          type: 'git',
          url: originRemoteUrl,
        };
      }
    } catch (error) {
      if (!error.message.includes('no gitconfig to be found')) {
        throw error;
      }
    }
  }

  pkg.devDependencies = pkg.devDependencies || {};
  pkg.devDependencies['release-it'] = getDependencyRange(
    pkg.devDependencies['release-it'],
    RELEASE_IT_VERSION
  );
  pkg.devDependencies['release-it-lerna-changelog'] = getDependencyRange(
    pkg.devDependencies['release-it-lerna-changelog'],
    RELEASE_IT_LERNA_CHANGELOG_VERSION
  );

  if (hasWorkspaces) {
    pkg.devDependencies['release-it-yarn-workspaces'] = getDependencyRange(
      pkg.devDependencies['release-it-yarn-workspaces'],
      RELEASE_IT_YARN_WORKSPACES_VERSION
    );
  }

  let releaseItConfig = pkg['release-it'] || {};
  pkg['release-it'] = releaseItConfig;

  releaseItConfig.plugins = releaseItConfig.plugins || {};
  releaseItConfig.plugins['release-it-lerna-changelog'] = Object.assign(
    {
      infile: 'CHANGELOG.md',
      launchEditor: hasEditor(),
    },
    releaseItConfig.plugins['release-it-lerna-changelog']
  );

  if (hasWorkspaces && releaseItConfig.plugins['release-it-yarn-workspaces'] !== false) {
    releaseItConfig.plugins['release-it-yarn-workspaces'] = true;
  }

  releaseItConfig.git = Object.assign(
    {
      tagName: 'v${version}',
    },
    releaseItConfig.git
  );
  releaseItConfig.github = Object.assign(
    {
      release: true,
      tokenRef: 'GITHUB_AUTH',
    },
    releaseItConfig.github
  );

  if (pkg.private && !('npm' in releaseItConfig)) {
    releaseItConfig.npm = false;
  }

  pkg.publishConfig = pkg.publishConfig || {};
  pkg.publishConfig.registry = pkg.publishConfig.registry || 'https://registry.npmjs.org';

  let sortedPkg = sortPackageJson(pkg);
  let updatedContents = JSON.stringify(sortedPkg, null, 2);

  if (trailingWhitespace) {
    updatedContents += trailingWhitespace[0];
  }

  fs.writeFileSync('package.json', updatedContents, { encoding: 'utf8' });

  return sortedPkg;
}

function findRepoURL(pkg) {
  if (!pkg.repository) {
    // no repo, nothing to do
    return;
  }

  // see https://docs.npmjs.com/configuring-npm/package-json#repository for valid formats
  const url = typeof pkg.repository === 'string' ? pkg.repository : pkg.repository.url;
  const repoInfo = getRepoInfoFromURL(url);
  if (repoInfo === undefined || repoInfo === null || repoInfo.type !== 'github') {
    return;
  }

  return `${repoInfo.user}/${repoInfo.project}`;
}

async function updateLabels(pkg) {
  if (skipLabels) {
    return;
  }

  const githubLabelSync = require('github-label-sync');

  let accessToken = process.env.GITHUB_AUTH;
  let labels = require('../labels');
  let repo = findRepoURL(pkg);

  // no repository setup, bail
  if (!repo) {
    return;
  }

  await githubLabelSync({
    accessToken,
    repo,
    labels,
    allowAddedLabels: true,
  });
}

function isYarn() {
  return fs.existsSync('yarn.lock');
}

async function installDependencies() {
  if (labelsOnly || skipInstall) {
    return;
  }

  if (isYarn()) {
    await execa('yarn');
  } else {
    await execa('npm', ['install']);
  }
}

async function main() {
  try {
    if (!fs.existsSync('package.json')) {
      /* eslint-disable-next-line no-console */
      console.error(
        "create-rwjblue-release-it-setup should be ran from within an existing npm package's root directory"
      );
      process.exitCode = 1;
      return;
    }

    if (!fs.existsSync('CHANGELOG.md') && !labelsOnly) {
      fs.writeFileSync('CHANGELOG.md', '', { encoding: 'utf8' });
    }

    if ((!fs.existsSync('RELEASE.md') || update) && !labelsOnly) {
      let releaseContents = fs.readFileSync(path.join(__dirname, '..', 'release-template.md'), {
        encoding: 'utf8',
      });

      let dependencyInstallReplacementValue = isYarn() ? 'yarn install' : 'npm install';

      fs.writeFileSync(
        'RELEASE.md',
        releaseContents.replace('{{INSTALL_DEPENDENCIES}}', dependencyInstallReplacementValue),
        { encoding: 'utf8' }
      );
    }

    let pkg = await updatePackageJSON();

    await installDependencies();

    // TODO: figure out a decent way to test this part
    await updateLabels(pkg);
  } catch (e) {
    /* eslint-disable-next-line no-console */
    console.error(e);

    throw e;
  }
}

module.exports = {
  findRepoURL,
  getDependencyRange,
};

if (require.main === module) {
  main();
}
