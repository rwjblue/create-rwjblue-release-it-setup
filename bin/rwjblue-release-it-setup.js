#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const execa = require('execa');
const sortPackageJson = require('sort-package-json');
const skipInstall = process.argv.includes('--no-install');

const DETECT_TRAILING_WHITESPACE = /\s+$/;

function updatePackageJSON() {
  let contents = fs.readFileSync('package.json', { encoding: 'utf8' });
  let trailingWhitespace = DETECT_TRAILING_WHITESPACE.exec(contents);
  let pkg = JSON.parse(contents);

  pkg.devDependencies = pkg.devDependencies || {};
  pkg.devDependencies['release-it'] = '^12.2.1';
  pkg.devDependencies['release-it-lerna-changelog'] = '^1.0.3';

  pkg.scripts = pkg.scripts || {};
  pkg.scripts.release = 'release-it';

  pkg['release-it'] = {
    plugins: {
      'release-it-lerna-changelog': {
        infile: 'CHANGELOG.md',
      },
    },
    git: {
      tagName: 'v${version}',
    },
    github: {
      release: true,
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
}

async function installDependencies() {
  if (fs.existsSync('yarn.lock')) {
    await execa('yarn');
  } else {
    await execa('npm', ['install']);
  }
}

async function main() {
  if (!fs.existsSync('package.json')) {
    /* eslint-disable-next-line no-console */
    console.error(
      "create-rwjblue-release-it-setup should be ran from within an existing npm package's root directory"
    );
    process.exitCode = 1;
    return;
  }

  if (!fs.existsSync('CHANGELOG.md')) {
    fs.writeFileSync('CHANGELOG.md', '', { encoding: 'utf8' });
  }

  if (!fs.existsSync('RELEASE.md')) {
    fs.writeFileSync(
      'RELEASE.md',
      fs.readFileSync(path.join(__dirname, '..', 'RELEASE.md'), { encoding: 'utf8' }),
      { encoding: 'utf8' }
    );
  }

  updatePackageJSON();

  if (!skipInstall) {
    await installDependencies();
  }
}

main();
