#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const execa = require('execa');
const sortPackageJson = require('sort-package-json');
const getRepoInfoFromURL = require('hosted-git-info').fromUrl;
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

const DETECT_TRAILING_WHITESPACE = /\s+$/;

function updatePackageJSON() {
  if (labelsOnly) {
    return;
  }

  let contents = fs.readFileSync('package.json', { encoding: 'utf8' });
  let trailingWhitespace = DETECT_TRAILING_WHITESPACE.exec(contents);
  let pkg = JSON.parse(contents);

  pkg.devDependencies = pkg.devDependencies || {};
  pkg.devDependencies['release-it'] = RELEASE_IT_VERSION;
  pkg.devDependencies['release-it-lerna-changelog'] = RELEASE_IT_LERNA_CHANGELOG_VERSION;

  pkg['release-it'] = {
    plugins: {
      'release-it-lerna-changelog': {
        infile: 'CHANGELOG.md',
        launchEditor: true,
      },
    },
    git: {
      tagName: 'v${version}',
    },
    github: {
      release: true,
      tokenRef: 'GITHUB_AUTH',
    },
  };
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

  const url = pkg.repository.url || pkg.repository;
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

    let pkg = updatePackageJSON();

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
};

if (require.main === module) {
  main();
}
