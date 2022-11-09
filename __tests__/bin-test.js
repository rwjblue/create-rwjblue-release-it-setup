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

  it('does not modify if an existing prefix exists in CHANGELOG.md', async function () {
    project.files['CHANGELOG.md'] = `# ChangeLog\n\n## v1.2.0\n* Foo bar`;
    project.writeSync();

    await exec(['--no-install', '--no-label-updates']);

    expect(fs.readFileSync('CHANGELOG.md', { encoding: 'utf8' })).toBe(
      '# ChangeLog\n\n## v1.2.0\n* Foo bar'
    );
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
            '@release-it-plugins/lerna-changelog': expect.toMatchDevDependency(
              '@release-it-plugins/lerna-changelog'
            ),
          },
        },
        `
        Object {
          "dependencies": Object {},
          "devDependencies": Object {
            "@release-it-plugins/lerna-changelog": toMatchDevDependency<@release-it-plugins/lerna-changelog>,
            "release-it": toMatchDevDependency<release-it>,
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
              "@release-it-plugins/lerna-changelog": Object {
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
            '@release-it-plugins/lerna-changelog': expect.toMatchDevDependency(
              '@release-it-plugins/lerna-changelog'
            ),
          },
        },
        `
        Object {
          "dependencies": Object {},
          "devDependencies": Object {
            "@release-it-plugins/lerna-changelog": toMatchDevDependency<@release-it-plugins/lerna-changelog>,
            "release-it": toMatchDevDependency<release-it>,
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
              "@release-it-plugins/lerna-changelog": Object {
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
            '@release-it-plugins/lerna-changelog': expect.toMatchDevDependency(
              '@release-it-plugins/lerna-changelog'
            ),
          },
        },
        `
        Object {
          "dependencies": Object {},
          "devDependencies": Object {
            "@release-it-plugins/lerna-changelog": toMatchDevDependency<@release-it-plugins/lerna-changelog>,
            "release-it": toMatchDevDependency<release-it>,
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
              "@release-it-plugins/lerna-changelog": Object {
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

      expect(
        pkg['release-it'].plugins['@release-it-plugins/lerna-changelog'].launchEditor
      ).toBeFalsy();
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
            '@release-it-plugins/lerna-changelog': expect.toMatchDevDependency(
              '@release-it-plugins/lerna-changelog'
            ),

            '@release-it-plugins/workspaces': expect.toMatchDevDependency(
              '@release-it-plugins/workspaces'
            ),
          },
        },
        `
        Object {
          "dependencies": Object {},
          "devDependencies": Object {
            "@release-it-plugins/lerna-changelog": toMatchDevDependency<@release-it-plugins/lerna-changelog>,
            "@release-it-plugins/workspaces": toMatchDevDependency<@release-it-plugins/workspaces>,
            "release-it": toMatchDevDependency<release-it>,
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
              "@release-it-plugins/lerna-changelog": Object {
                "infile": "CHANGELOG.md",
                "launchEditor": true,
              },
              "@release-it-plugins/workspaces": true,
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
          '@release-it-plugins/lerna-changelog': {
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
            '@release-it-plugins/lerna-changelog': expect.toMatchDevDependency(
              '@release-it-plugins/lerna-changelog'
            ),
          },
        },
        `
        Object {
          "dependencies": Object {},
          "devDependencies": Object {
            "@release-it-plugins/lerna-changelog": toMatchDevDependency<@release-it-plugins/lerna-changelog>,
            "release-it": toMatchDevDependency<release-it>,
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
              "@release-it-plugins/lerna-changelog": Object {
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
            '@release-it-plugins/lerna-changelog': expect.toMatchDevDependency(
              '@release-it-plugins/lerna-changelog'
            ),
          },
        },
        `
        Object {
          "dependencies": Object {},
          "devDependencies": Object {
            "@release-it-plugins/lerna-changelog": toMatchDevDependency<@release-it-plugins/lerna-changelog>,
            "release-it": "^999.999.999",
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
              "@release-it-plugins/lerna-changelog": Object {
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

    it('does not update devDependencies if @release-it-plugins/lerna-changelog range is greater', async function () {
      project.addDevDependency('@release-it-plugins/lerna-changelog', '^999999.0.0');
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
            "@release-it-plugins/lerna-changelog": "^999999.0.0",
            "release-it": toMatchDevDependency<release-it>,
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
              "@release-it-plugins/lerna-changelog": Object {
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

    it('migrates from old plugins to new ones', async function () {
      project.addDevDependency('release-it-lerna-changelog', '^1.0.0');
      project.pkg['release-it'] = {
        plugins: {
          'release-it-lerna-changelog': {
            infile: 'RELEASES.md',
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
            '@release-it-plugins/lerna-changelog': expect.toMatchDevDependency(
              '@release-it-plugins/lerna-changelog'
            ),
          },
        },
        `
        Object {
          "dependencies": Object {},
          "devDependencies": Object {
            "@release-it-plugins/lerna-changelog": toMatchDevDependency<@release-it-plugins/lerna-changelog>,
            "release-it": toMatchDevDependency<release-it>,
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
            "plugins": Object {
              "@release-it-plugins/lerna-changelog": Object {
                "infile": "RELEASES.md",
                "launchEditor": false,
              },
            },
          },
          "version": "0.1.0",
        }
      `
      );
    });

    it('migrates monorepo from old plugins to new ones', async function () {
      project.pkg.workspaces = ['packages/*'];
      project.addDevDependency('release-it-lerna-changelog', '^1.0.0');
      project.addDevDependency('release-it-yarn-workspaces', '^1.0.0');
      project.pkg['release-it'] = {
        plugins: {
          'release-it-lerna-changelog': {
            infile: 'RELEASES.md',
            launchEditor: false,
          },
          'release-it-yarn-workspaces': true,
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
            '@release-it-plugins/lerna-changelog': expect.toMatchDevDependency(
              '@release-it-plugins/lerna-changelog'
            ),

            '@release-it-plugins/workspaces': expect.toMatchDevDependency(
              '@release-it-plugins/workspaces'
            ),
          },
        },
        `
        Object {
          "dependencies": Object {},
          "devDependencies": Object {
            "@release-it-plugins/lerna-changelog": toMatchDevDependency<@release-it-plugins/lerna-changelog>,
            "@release-it-plugins/workspaces": toMatchDevDependency<@release-it-plugins/workspaces>,
            "release-it": toMatchDevDependency<release-it>,
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
            "plugins": Object {
              "@release-it-plugins/lerna-changelog": Object {
                "infile": "RELEASES.md",
                "launchEditor": false,
              },
              "@release-it-plugins/workspaces": true,
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

    // skip this test when running locally, it is pretty slow and unlikely to _actually_ matter
    (process.env.CI ? it : it.skip)(
      'installs dependencies',
      async function () {
        await exec(['--no-label-updates']);

        expect(fs.existsSync('node_modules/release-it')).toBeTruthy();
        expect(fs.existsSync('node_modules/@release-it-plugins/lerna-changelog')).toBeTruthy();
      },
      60000
    );
  });

  describe('RELEASE.md', function () {
    function expectedReleaseContents(packageManager = 'npm') {
      let releaseContents = fs.readFileSync(path.join(__dirname, '..', 'release-template.md'), {
        encoding: 'utf8',
      });

      let dependencyInstallReplacementValue = `${packageManager} install`;
      let releaseCommandReplacementValue =
        packageManager === 'pnpm' ? 'pnpm exec release-it' : 'npx release-it';

      return releaseContents
        .replace('{{INSTALL_DEPENDENCIES}}', dependencyInstallReplacementValue)
        .replace('{{RELEASE_COMMAND}}', releaseCommandReplacementValue);
    }

    it('adds RELEASE.md to repo when no yarn.lock exists', async function () {
      expect(fs.existsSync('RELEASE.md')).toBeFalsy();

      await exec(['--no-install', '--no-label-updates']);

      expect(fs.readFileSync('RELEASE.md', { encoding: 'utf8' })).toBe(
        expectedReleaseContents('npm')
      );
    });

    it('adds RELEASE.md to repo when yarn.lock exists', async function () {
      fs.writeFileSync('yarn.lock', '', { encoding: 'utf-8' });

      expect(fs.existsSync('RELEASE.md')).toBeFalsy();

      await exec(['--no-install', '--no-label-updates']);

      expect(fs.readFileSync('RELEASE.md', { encoding: 'utf8' })).toBe(
        expectedReleaseContents('yarn')
      );
    });

    it('adds RELEASE.md to repo when pnpm-lock.yaml exists', async function () {
      fs.writeFileSync('pnpm-lock.yaml', '', { encoding: 'utf-8' });

      expect(fs.existsSync('RELEASE.md')).toBeFalsy();

      await exec(['--no-install', '--no-label-updates']);

      expect(fs.readFileSync('RELEASE.md', { encoding: 'utf8' })).toBe(
        expectedReleaseContents('pnpm')
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
          expectedReleaseContents('yarn')
        );
      });

      it('updates RELEASE.md when pnpm-lock.yaml exists', async function () {
        fs.writeFileSync('pnpm-lock.yaml', '', { encoding: 'utf-8' });
        fs.writeFileSync('RELEASE.md', 'lololol', 'utf8');

        await exec(['--no-install', '--no-label-updates', '--update']);

        expect(fs.readFileSync('RELEASE.md', { encoding: 'utf8' })).toBe(
          expectedReleaseContents('pnpm')
        );
      });

      it('updates RELEASE.md when no yarn.lock exists', async function () {
        fs.writeFileSync('RELEASE.md', 'lololol', 'utf8');

        await exec(['--no-install', '--no-label-updates', '--update']);

        expect(fs.readFileSync('RELEASE.md', { encoding: 'utf8' })).toBe(
          expectedReleaseContents('npm')
        );
      });

      it('adds a basic header in changelog if prefix does not exist in CHANGELOG.md', async function () {
        project.files['CHANGELOG.md'] = `## v1.2.0\n* Foo bar`;
        project.writeSync();

        await exec(['--no-install', '--no-label-updates', '--update']);

        expect(fs.readFileSync('CHANGELOG.md', { encoding: 'utf8' })).toBe(
          '# Changelog\n\n## v1.2.0\n* Foo bar'
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
