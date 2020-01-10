#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const execa = require('execa');
const sortPackageJson = require('sort-package-json');
const skipInstall = process.argv.includes('--no-install');
const skipLabels = process.argv.includes('--no-label-updates');
const labelsOnly = process.argv.includes('--labels-only');
const update = process.argv.includes('--update');
const noMerges = process.argv.includes('--no-changelog-merges');

const DETECT_TRAILING_WHITESPACE = /\s+$/;

function updatePackageJSON() {
  if (labelsOnly) {
    return;
  }

  let contents = fs.readFileSync('package.json', { encoding: 'utf8' });
  let trailingWhitespace = DETECT_TRAILING_WHITESPACE.exec(contents);
  let pkg = JSON.parse(contents);
  let changelog =
    // eslint-disable-next-line prettier/prettier, no-useless-escape
    'git log --pretty=format:\"* %s (%h)\" --perl-regexp --author=\"^((?!dependabot-preview).*)$\" ${latestTag}...HEAD';

  pkg.devDependencies = pkg.devDependencies || {};
  pkg.devDependencies['release-it'] = '^12.2.1';
  pkg.devDependencies['release-it-lerna-changelog'] = '^1.0.3';

  pkg['release-it'] = {
    plugins: {
      'release-it-lerna-changelog': {
        infile: 'CHANGELOG.md',
      },
    },
    git: {
      tagName: 'v${version}',
      changelog,
    },
    github: {
      release: true,
    },
  };
  pkg.publishConfig = pkg.publishConfig || {};
  pkg.publishConfig.registry = pkg.publishConfig.registry || 'https://registry.npmjs.org';

  if (noMerges) {
    let latestTagExpression = '${latestTag}';
    let noMergesOption = noMerges ? '--no-merges ' : '';

    // eslint-disable-next-line prettier/prettier, no-useless-escape
    changelog = `git log --pretty=format:\"* %s (%h)\" ${noMergesOption}--perl-regexp --author=\"^((?!dependabot-preview).*)$\" ${latestTagExpression}...HEAD`;
  }

  pkg['release-it'].git.changelog = changelog;

  let sortedPkg = sortPackageJson(pkg);
  let updatedContents = JSON.stringify(sortedPkg, null, 2);

  if (trailingWhitespace) {
    updatedContents += trailingWhitespace[0];
  }

  fs.writeFileSync('package.json', updatedContents, { encoding: 'utf8' });
}

// from lerna-changelog https://github.com/lerna/lerna-changelog/blob/669a9f23068855f318b5242f9ff7ae0672402311/src/configuration.ts
function findRepoURL() {
  if (!fs.existsSync('package.json')) {
    return;
  }

  const pkg = JSON.parse(fs.readFileSync('package.json', { encoding: 'utf8' }));
  if (!pkg.repository) {
    // no repo, nothing to do
    return;
  }

  const url = pkg.repository.url || pkg.repository;
  const match = url.match(/github\.com[:/]([^./]+\/[^./]+)(?:\.git)?/);
  if (!match) {
    return;
  }

  return match[1];
}

async function updateLabels() {
  if (skipLabels) {
    return;
  }

  const githubLabelSync = require('github-label-sync');

  let accessToken = process.env.GITHUB_ACCESS_TOKEN;
  let labels = require('../labels');
  let repo = findRepoURL();

  await githubLabelSync({
    accessToken,
    repo,
    labels,
  });
}

async function installDependencies() {
  if (labelsOnly || skipInstall) {
    return;
  }
  if (fs.existsSync('yarn.lock')) {
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
      fs.writeFileSync(
        'RELEASE.md',
        fs.readFileSync(path.join(__dirname, '..', 'RELEASE.md'), { encoding: 'utf8' }),
        { encoding: 'utf8' }
      );
    }

    updatePackageJSON();

    await installDependencies();

    // TODO: figure out a decent way to test this part
    await updateLabels();
  } catch (e) {
    /* eslint-disable-next-line no-console */
    console.error(e);

    throw e;
  }
}

main();
