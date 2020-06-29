const fs = require('fs');
const path = require('path');
const Project = require('fixturify-project');
const BinScript = require('../bin/rwjblue-release-it-setup');
const execa = require('execa');

const BIN_PATH = require.resolve('../bin/rwjblue-release-it-setup');
const ROOT = process.cwd();
const EDITOR = 'EDITOR' in process.env ? process.env.EDITOR : null;
const PATH = process.env.PATH;

function exec(args) {
  return execa(process.execPath, ['--unhandled-rejections=strict', BIN_PATH, ...args]);
}

expect.extend({
  toMatchDevDependency(actual, name) {
    let pkg = require('../package');
    let expected = pkg.devDependencies[name];

    return {
      message: () => `expected ${name} to be specified as \`${expected}\` but was ${actual}`,
      pass: expected === actual,
    };
  },
});

describe('main binary', function () {
  let project;

  beforeEach(function () {
    project = new Project('some-thing-cool', '0.1.0');
    project.writeSync();
    process.chdir(path.join(project.root, project.name));

    // ensure an EDITOR is present
    process.env.EDITOR = '/bin/whatever';
  });

  afterEach(function () {
    process.chdir(ROOT);

    // reset process.env.EDITOR to initial state
    if (EDITOR === null) {
      delete process.env.EDITOR;
    } else {
      process.env.EDITOR = EDITOR;
    }

    process.env.PATH = PATH;
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
    it('adds repository info when discoverable from `.git/config`', async function () {
      project.files['.git'] = {
        config: `
[core]
  repositoryformatversion = 0
  filemode = true
  bare = false
  logallrefupdates = true
  ignorecase = true
  precomposeunicode = true

[remote "origin"]
  url = git@github.com:someuser/some-repo.git
  fetch = +refs/heads/*:refs/remotes/origin/*`,
      };

      project.writeSync();

      await exec(['--no-install', '--no-label-updates']);

      let pkg = JSON.parse(fs.readFileSync('package.json', { encoding: 'utf8' }));

      expect(pkg).toMatchInlineSnapshot(
        {
          devDependencies: {
            'release-it': expect.toMatchDevDependency('release-it'),
            'release-it-lerna-changelog': expect.toMatchDevDependency('release-it-lerna-changelog'),
          },
        },
        `
        Object {
          "dependencies": Object {},
          "devDependencies": Object {
            "release-it": toMatchDevDependency<release-it>,
            "release-it-lerna-changelog": toMatchDevDependency<release-it-lerna-changelog>,
          },
          "keywords": Array [],
          "name": "some-thing-cool",
          "publishConfig": Object {
            "registry": "https://registry.npmjs.org",
          },
          "release-it": Object {
            "git": Object {
              "tagName": "v\${version}",
            },
            "github": Object {
              "release": true,
              "tokenRef": "GITHUB_AUTH",
            },
            "plugins": Object {
              "release-it-lerna-changelog": Object {
                "infile": "CHANGELOG.md",
                "launchEditor": true,
              },
            },
          },
          "repository": Object {
            "type": "git",
            "url": "git@github.com:someuser/some-repo.git",
          },
          "version": "0.1.0",
        }
      `
      );
    });

    it('adds release-it configuration and devDependencies to package.json', async function () {
      await exec(['--no-install', '--no-label-updates']);

      let pkg = JSON.parse(fs.readFileSync('package.json', { encoding: 'utf8' }));

      expect(pkg).toMatchInlineSnapshot(
        {
          devDependencies: {
            'release-it': expect.toMatchDevDependency('release-it'),
            'release-it-lerna-changelog': expect.toMatchDevDependency('release-it-lerna-changelog'),
          },
        },
        `
        Object {
          "dependencies": Object {},
          "devDependencies": Object {
            "release-it": toMatchDevDependency<release-it>,
            "release-it-lerna-changelog": toMatchDevDependency<release-it-lerna-changelog>,
          },
          "keywords": Array [],
          "name": "some-thing-cool",
          "publishConfig": Object {
            "registry": "https://registry.npmjs.org",
          },
          "release-it": Object {
            "git": Object {
              "tagName": "v\${version}",
            },
            "github": Object {
              "release": true,
              "tokenRef": "GITHUB_AUTH",
            },
            "plugins": Object {
              "release-it-lerna-changelog": Object {
                "infile": "CHANGELOG.md",
                "launchEditor": true,
              },
            },
          },
          "version": "0.1.0",
        }
      `
      );
    });

    it('adds npm: false when package is marked as private', async function () {
      project.pkg.private = true;
      project.writeSync();

      await exec(['--no-install', '--no-label-updates']);

      let pkg = JSON.parse(fs.readFileSync('package.json', { encoding: 'utf8' }));

      expect(pkg).toMatchInlineSnapshot(
        {
          devDependencies: {
            'release-it': expect.toMatchDevDependency('release-it'),
            'release-it-lerna-changelog': expect.toMatchDevDependency('release-it-lerna-changelog'),
          },
        },
        `
        Object {
          "dependencies": Object {},
          "devDependencies": Object {
            "release-it": toMatchDevDependency<release-it>,
            "release-it-lerna-changelog": toMatchDevDependency<release-it-lerna-changelog>,
          },
          "keywords": Array [],
          "name": "some-thing-cool",
          "private": true,
          "publishConfig": Object {
            "registry": "https://registry.npmjs.org",
          },
          "release-it": Object {
            "git": Object {
              "tagName": "v\${version}",
            },
            "github": Object {
              "release": true,
              "tokenRef": "GITHUB_AUTH",
            },
            "npm": false,
            "plugins": Object {
              "release-it-lerna-changelog": Object {
                "infile": "CHANGELOG.md",
                "launchEditor": true,
              },
            },
          },
          "version": "0.1.0",
        }
      `
      );
    });

    it('does not add launchEditor if no $EDITOR is found', async function () {
      delete process.env.EDITOR;

      // have to reset $PATH in order to ensure `launchEditor` is false on Ubuntu systems
      // since they always have a `editor` command
      process.env.PATH = '';

      await exec(['--no-install', '--no-label-updates']);

      let pkg = JSON.parse(fs.readFileSync('package.json', { encoding: 'utf8' }));

      expect(pkg['release-it'].plugins['release-it-lerna-changelog'].launchEditor).toBeFalsy();
    });

    it('adds release-it configuration for monorepos to package.json', async function () {
      project.pkg.workspaces = ['packages/*'];
      project.writeSync();

      await exec(['--no-install', '--no-label-updates']);

      let pkg = JSON.parse(fs.readFileSync('package.json', { encoding: 'utf8' }));

      expect(pkg).toMatchInlineSnapshot(
        {
          devDependencies: {
            'release-it': expect.toMatchDevDependency('release-it'),
            'release-it-lerna-changelog': expect.toMatchDevDependency('release-it-lerna-changelog'),
            'release-it-yarn-workspaces': expect.toMatchDevDependency('release-it-yarn-workspaces'),
          },
        },
        `
        Object {
          "dependencies": Object {},
          "devDependencies": Object {
            "release-it": toMatchDevDependency<release-it>,
            "release-it-lerna-changelog": toMatchDevDependency<release-it-lerna-changelog>,
            "release-it-yarn-workspaces": toMatchDevDependency<release-it-yarn-workspaces>,
          },
          "keywords": Array [],
          "name": "some-thing-cool",
          "publishConfig": Object {
            "registry": "https://registry.npmjs.org",
          },
          "release-it": Object {
            "git": Object {
              "tagName": "v\${version}",
            },
            "github": Object {
              "release": true,
              "tokenRef": "GITHUB_AUTH",
            },
            "plugins": Object {
              "release-it-lerna-changelog": Object {
                "infile": "CHANGELOG.md",
                "launchEditor": true,
              },
              "release-it-yarn-workspaces": true,
            },
          },
          "version": "0.1.0",
          "workspaces": Array [
            "packages/*",
          ],
        }
      `
      );
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

      await exec(['--no-install', '--no-label-updates']);

      let pkg = JSON.parse(fs.readFileSync('package.json', { encoding: 'utf8' }));

      expect(pkg).toMatchInlineSnapshot(
        {
          devDependencies: {
            'release-it': expect.toMatchDevDependency('release-it'),
            'release-it-lerna-changelog': expect.toMatchDevDependency('release-it-lerna-changelog'),
          },
        },
        `
        Object {
          "dependencies": Object {},
          "devDependencies": Object {
            "release-it": toMatchDevDependency<release-it>,
            "release-it-lerna-changelog": toMatchDevDependency<release-it-lerna-changelog>,
          },
          "keywords": Array [],
          "name": "some-thing-cool",
          "publishConfig": Object {
            "registry": "https://registry.npmjs.org",
          },
          "release-it": Object {
            "git": Object {
              "some-other": "prop",
              "tagName": "v\${version}",
            },
            "github": Object {
              "release": true,
              "tokenRef": "GITHUB_AUTH",
            },
            "hooks": Object {
              "after:bump": "npm run something",
            },
            "plugins": Object {
              "release-it-lerna-changelog": Object {
                "infile": "CHANGELOG.md",
                "launchEditor": false,
              },
            },
          },
          "version": "0.1.0",
        }
      `
      );
    });

    it('does not update devDependencies if release-it range is greater', async function () {
      project.addDevDependency('release-it', '^999.999.999');
      project.writeSync();

      await exec(['--no-install', '--no-label-updates']);

      let pkg = JSON.parse(fs.readFileSync('package.json', { encoding: 'utf8' }));

      expect(pkg).toMatchInlineSnapshot(
        {
          devDependencies: {
            'release-it-lerna-changelog': expect.toMatchDevDependency('release-it-lerna-changelog'),
          },
        },
        `
        Object {
          "dependencies": Object {},
          "devDependencies": Object {
            "release-it": "^999.999.999",
            "release-it-lerna-changelog": toMatchDevDependency<release-it-lerna-changelog>,
          },
          "keywords": Array [],
          "name": "some-thing-cool",
          "publishConfig": Object {
            "registry": "https://registry.npmjs.org",
          },
          "release-it": Object {
            "git": Object {
              "tagName": "v\${version}",
            },
            "github": Object {
              "release": true,
              "tokenRef": "GITHUB_AUTH",
            },
            "plugins": Object {
              "release-it-lerna-changelog": Object {
                "infile": "CHANGELOG.md",
                "launchEditor": true,
              },
            },
          },
          "version": "0.1.0",
        }
      `
      );
    });

    it('does not update devDependencies if release-it-lerna-changelog range is greater', async function () {
      project.addDevDependency('release-it-lerna-changelog', '^3.0.0');
      project.writeSync();

      await exec(['--no-install', '--no-label-updates']);

      let pkg = JSON.parse(fs.readFileSync('package.json', { encoding: 'utf8' }));

      expect(pkg).toMatchInlineSnapshot(
        {
          devDependencies: {
            'release-it': expect.toMatchDevDependency('release-it'),
          },
        },
        `
        Object {
          "dependencies": Object {},
          "devDependencies": Object {
            "release-it": toMatchDevDependency<release-it>,
            "release-it-lerna-changelog": "^3.0.0",
          },
          "keywords": Array [],
          "name": "some-thing-cool",
          "publishConfig": Object {
            "registry": "https://registry.npmjs.org",
          },
          "release-it": Object {
            "git": Object {
              "tagName": "v\${version}",
            },
            "github": Object {
              "release": true,
              "tokenRef": "GITHUB_AUTH",
            },
            "plugins": Object {
              "release-it-lerna-changelog": Object {
                "infile": "CHANGELOG.md",
                "launchEditor": true,
              },
            },
          },
          "version": "0.1.0",
        }
      `
      );
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
      ${''}                                      | ${undefined}
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
