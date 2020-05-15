const fs = require('fs');
const path = require('path');
const Project = require('fixturify-project');
const BinScript = require('../bin/rwjblue-release-it-setup');
const execa = require('execa');

const BIN_PATH = require.resolve('../bin/rwjblue-release-it-setup');
const ROOT = process.cwd();

function exec(args) {
  return execa(process.execPath, ['--unhandled-rejections=strict', BIN_PATH, ...args]);
}

describe('main binary', function () {
  let project;

  function mergePackageJSON(original, updates) {
    return Object.assign({}, original, updates, {
      publishConfig: Object.assign({}, original.publishConfig, updates.publishConfig),
      dependencies: Object.assign({}, original.dependencies, updates.dependencies),
      devDependencies: Object.assign({}, original.devDependencies, updates.devDependencies),
    });
  }

  beforeEach(function () {
    project = new Project('some-thing-cool', '0.1.0');
    project.writeSync();
    process.chdir(path.join(project.root, project.name));
  });

  afterEach(function () {
    process.chdir(ROOT);
  });

  it('adds CHANGELOG.md file', async function () {
    expect(fs.existsSync('CHANGELOG.md')).toBeFalsy();

    await exec(['--no-install', '--no-label-updates']);

    expect(fs.existsSync('CHANGELOG.md')).toBeTruthy();
  });

  it.skip('removes prefix from existing CHANGELOG.md', async function () {
    project.files['CHANGELOG.md'] = `# master\n\n# v1.2.0\n* Foo bar`;

    await exec(['--no-install', '--no-label-updates']);

    expect(fs.readFileSync('CHANGELOG.md', { encoding: 'utf8' })).toBe('# v1.2.0\n* Foo bar');
  });

  describe('package.json', function () {
    it('adds release-it configuration and devDependencies to package.json', async function () {
      let premodificationPackageJSON = JSON.parse(project.toJSON('package.json'));

      await exec(['--no-install', '--no-label-updates']);

      let pkg = JSON.parse(fs.readFileSync('package.json', { encoding: 'utf8' }));
      let expected = mergePackageJSON(premodificationPackageJSON, {
        devDependencies: {
          'release-it': require('../package').devDependencies['release-it'],
          'release-it-lerna-changelog': require('../package').devDependencies[
            'release-it-lerna-changelog'
          ],
        },
        publishConfig: {
          registry: 'https://registry.npmjs.org',
        },
        'release-it': {
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
        },
      });

      expect(pkg).toEqual(expected);
    });

    it('adds npm: false when package is marked as private', async function () {
      project.pkg.private = true;
      project.writeSync();

      let premodificationPackageJSON = JSON.parse(project.toJSON('package.json'));

      await exec(['--no-install', '--no-label-updates']);

      let pkg = JSON.parse(fs.readFileSync('package.json', { encoding: 'utf8' }));
      let expected = mergePackageJSON(premodificationPackageJSON, {
        devDependencies: {
          'release-it': require('../package').devDependencies['release-it'],
          'release-it-lerna-changelog': require('../package').devDependencies[
            'release-it-lerna-changelog'
          ],
        },
        publishConfig: {
          registry: 'https://registry.npmjs.org',
        },
        'release-it': {
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
          npm: false,
        },
      });

      expect(pkg).toEqual(expected);
    });

    it('adds release-it configuration for monorepos to package.json', async function () {
      project.pkg.workspaces = ['packages/*'];
      project.writeSync();

      let premodificationPackageJSON = JSON.parse(project.toJSON('package.json'));

      await exec(['--no-install', '--no-label-updates']);

      let pkg = JSON.parse(fs.readFileSync('package.json', { encoding: 'utf8' }));
      let expected = mergePackageJSON(premodificationPackageJSON, {
        devDependencies: {
          'release-it': require('../package').devDependencies['release-it'],
          'release-it-lerna-changelog': require('../package').devDependencies[
            'release-it-lerna-changelog'
          ],
          'release-it-yarn-workspaces': require('../package').devDependencies[
            'release-it-yarn-workspaces'
          ],
        },
        publishConfig: {
          registry: 'https://registry.npmjs.org',
        },
        'release-it': {
          plugins: {
            'release-it-lerna-changelog': {
              infile: 'CHANGELOG.md',
              launchEditor: true,
            },
            'release-it-yarn-workspaces': true,
          },
          git: {
            tagName: 'v${version}',
          },
          github: {
            release: true,
            tokenRef: 'GITHUB_AUTH',
          },
        },
      });

      expect(pkg).toEqual(expected);
    });

    it('does not remove existing release-it configuration', async function () {
      project.pkg['release-it'] = {
        hooks: {
          'after:bump': 'npm run something',
        },
        plugins: {
          'release-it-lerna-changelog': {
            launchEditor: false,
          },
        },
        git: {
          'some-other': 'prop',
        },
      };
      project.writeSync();

      let premodificationPackageJSON = JSON.parse(project.toJSON('package.json'));

      expect(premodificationPackageJSON['release-it']).toEqual({
        hooks: {
          'after:bump': 'npm run something',
        },
        plugins: {
          'release-it-lerna-changelog': {
            launchEditor: false,
          },
        },
        git: {
          'some-other': 'prop',
        },
      });

      await exec(['--no-install', '--no-label-updates']);

      let pkg = JSON.parse(fs.readFileSync('package.json', { encoding: 'utf8' }));
      let expected = mergePackageJSON(premodificationPackageJSON, {
        devDependencies: {
          'release-it': require('../package').devDependencies['release-it'],
          'release-it-lerna-changelog': require('../package').devDependencies[
            'release-it-lerna-changelog'
          ],
        },
        publishConfig: {
          registry: 'https://registry.npmjs.org',
        },
        'release-it': {
          hooks: {
            'after:bump': 'npm run something',
          },
          plugins: {
            'release-it-lerna-changelog': {
              infile: 'CHANGELOG.md',
              launchEditor: false,
            },
          },
          git: {
            tagName: 'v${version}',
            'some-other': 'prop',
          },
          github: {
            release: true,
            tokenRef: 'GITHUB_AUTH',
          },
        },
      });

      expect(pkg).toEqual(expected);
    });

    it('does not update devDependencies if release-it range is greater', async function () {
      project.addDevDependency('release-it', '^999.999.999');
      project.writeSync();

      let premodificationPackageJSON = JSON.parse(project.toJSON('package.json'));

      await exec(['--no-install', '--no-label-updates']);

      let pkg = JSON.parse(fs.readFileSync('package.json', { encoding: 'utf8' }));
      let expected = mergePackageJSON(premodificationPackageJSON, {
        devDependencies: {
          'release-it': '^999.999.999',
          'release-it-lerna-changelog': require('../package').devDependencies[
            'release-it-lerna-changelog'
          ],
        },
        publishConfig: {
          registry: 'https://registry.npmjs.org',
        },
        'release-it': {
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
        },
      });

      expect(pkg).toEqual(expected);
    });

    it('does not update devDependencies if release-it-lerna-changelog range is greater', async function () {
      project.addDevDependency('release-it-lerna-changelog', '^3.0.0');
      project.writeSync();

      let premodificationPackageJSON = JSON.parse(project.toJSON('package.json'));

      await exec(['--no-install', '--no-label-updates']);

      let pkg = JSON.parse(fs.readFileSync('package.json', { encoding: 'utf8' }));
      let expected = mergePackageJSON(premodificationPackageJSON, {
        devDependencies: {
          'release-it': require('../package').devDependencies['release-it'],
          'release-it-lerna-changelog': '^3.0.0',
        },
        publishConfig: {
          registry: 'https://registry.npmjs.org',
        },
        'release-it': {
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
        },
      });

      expect(pkg).toEqual(expected);
    });

    // skip this test when running locally, it is pretty slow and unlikely to _actually_ matter
    (process.env.CI ? it : it.skip)(
      'installs dependencies',
      async function () {
        await exec(['--no-label-updates']);

        expect(fs.existsSync('node_modules/release-it')).toBeTruthy();
        expect(fs.existsSync('node_modules/release-it-lerna-changelog')).toBeTruthy();
      },
      15000
    );
  });

  describe('RELEASE.md', function () {
    function expectedReleaseContents(isYarn) {
      let releaseContents = fs.readFileSync(path.join(__dirname, '..', 'release-template.md'), {
        encoding: 'utf8',
      });

      let dependencyInstallReplacementValue = isYarn ? 'yarn install' : 'npm install';

      return releaseContents.replace('{{INSTALL_DEPENDENCIES}}', dependencyInstallReplacementValue);
    }

    it('adds RELEASE.md to repo when no yarn.lock exists', async function () {
      expect(fs.existsSync('RELEASE.md')).toBeFalsy();

      await exec(['--no-install', '--no-label-updates']);

      expect(fs.readFileSync('RELEASE.md', { encoding: 'utf8' })).toBe(
        expectedReleaseContents(false)
      );
    });

    it('adds RELEASE.md to repo when yarn.lock exists', async function () {
      fs.writeFileSync('yarn.lock', '', { encoding: 'utf-8' });

      expect(fs.existsSync('RELEASE.md')).toBeFalsy();

      await exec(['--no-install', '--no-label-updates']);

      expect(fs.readFileSync('RELEASE.md', { encoding: 'utf8' })).toBe(
        expectedReleaseContents(true)
      );
    });

    describe('--update', function () {
      beforeEach(async function () {
        await exec(['--no-install', '--no-label-updates']);
      });

      it('updates RELEASE.md when yarn.lock exists', async function () {
        fs.writeFileSync('yarn.lock', '', { encoding: 'utf-8' });
        fs.writeFileSync('RELEASE.md', 'lololol', 'utf8');

        await exec(['--no-install', '--no-label-updates', '--update']);

        expect(fs.readFileSync('RELEASE.md', { encoding: 'utf8' })).toBe(
          expectedReleaseContents(true)
        );
      });

      it('updates RELEASE.md when no yarn.lock exists', async function () {
        fs.writeFileSync('RELEASE.md', 'lololol', 'utf8');

        await exec(['--no-install', '--no-label-updates', '--update']);

        expect(fs.readFileSync('RELEASE.md', { encoding: 'utf8' })).toBe(
          expectedReleaseContents(false)
        );
      });
    });
  });
});

describe('unit', function () {
  describe('findRepoURL', function () {
    it.each`
      source                                     | expected
      ${'https://github.com/rwjblue/foo'}        | ${'rwjblue/foo'}
      ${'https://github.com/rwjblue/foo.git'}    | ${'rwjblue/foo'}
      ${'https://github.com/rwjblue/foo.js.git'} | ${'rwjblue/foo.js'}
      ${'git@github.com:rwjblue/foo.git'}        | ${'rwjblue/foo'}
      ${'git@github.com:rwjblue/foo.js.git'}     | ${'rwjblue/foo.js'}
      ${'git@github.com:rwjblue/foo.js.git'}     | ${'rwjblue/foo.js'}
      ${'rwjblue/foo'}                           | ${'rwjblue/foo'}
      ${'rwjblue/foo.js'}                        | ${'rwjblue/foo.js'}
    `('$source -> $expected', ({ source, expected }) => {
      expect(BinScript.findRepoURL({ repository: source })).toBe(expected);
      expect(BinScript.findRepoURL({ repository: { url: source } })).toBe(expected);
    });
  });

  describe('getDependencyRange', function () {
    it.each`
      theirs              | ours        | expected
      ${'1.0.0'}          | ${'^2.0.0'} | ${'^2.0.0'}
      ${'^3.0.0'}         | ${'^2.0.0'} | ${'^3.0.0'}
      ${'github:foo/bar'} | ${'^2.0.0'} | ${'github:foo/bar'}
      ${'foo/bar'}        | ${'^2.0.0'} | ${'foo/bar'}
    `('returns $expected given $theirs -> $ours', ({ ours, theirs, expected }) => {
      expect(BinScript.getDependencyRange(theirs, ours)).toBe(expected);
    });
  });
});
