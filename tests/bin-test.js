const fs = require('fs');
const path = require('path');
const Project = require('fixturify-project');
const execa = require('execa');

const BIN_PATH = require.resolve('../bin/rwjblue-release-it-setup');
const ROOT = process.cwd();

QUnit.module('main binary', function(hooks) {
  let project;

  function mergePackageJSON(original, updates) {
    return Object.assign({}, original, updates, {
      publishConfig: Object.assign({}, original.publishConfig, updates.publishConfig),
      dependencies: Object.assign({}, original.dependencies, updates.dependencies),
      devDependencies: Object.assign({}, original.devDependencies, updates.devDependencies),
    });
  }

  hooks.beforeEach(function() {
    project = new Project('some-thing-cool', '0.1.0');
    project.writeSync();
    process.chdir(path.join(project.root, project.name));
  });

  hooks.afterEach(function() {
    process.chdir(ROOT);
  });

  QUnit.test('adds CHANGELOG.md file', async function(assert) {
    assert.notOk(fs.existsSync('CHANGELOG.md'), 'precond - CHANGELOG.md is not present');

    await execa(BIN_PATH, ['--no-install', '--no-label-updates']);

    assert.ok(fs.existsSync('CHANGELOG.md'), 'CHANGELOG.md is present');
  });

  QUnit.skip('removes prefix from existing CHANGELOG.md', async function(assert) {
    project.files['CHANGELOG.md'] = `# master\n\n# v1.2.0\n* Foo bar`;

    await execa(BIN_PATH, ['--no-install', '--no-label-updates']);

    assert.strictEqual(
      fs.readFileSync('CHANGELOG.md', { encoding: 'utf8' }),
      '# v1.2.0\n* Foo bar',
      'removes empty prefix from CHANGELOG.md'
    );
  });

  QUnit.test('updates the package.json', async function(assert) {
    let premodificationPackageJSON = JSON.parse(project.toJSON('package.json'));

    await execa(BIN_PATH, ['--no-install', '--no-label-updates']);

    let pkg = JSON.parse(fs.readFileSync('package.json', { encoding: 'utf8' }));
    let expected = mergePackageJSON(premodificationPackageJSON, {
      devDependencies: {
        'release-it': '^12.2.1',
        'release-it-lerna-changelog': '^1.0.3',
      },
      publishConfig: {
        registry: 'https://registry.npmjs.org',
      },
      'release-it': {
        plugins: {
          'release-it-lerna-changelog': {
            infile: 'CHANGELOG.md',
          },
        },
        git: {
          tagName: 'v${version}',
          changelog:
            'git log --pretty=format:"* %s (%h)" --perl-regexp --author="^((?!dependabot-preview).*)$" ${latestTag}...HEAD',
        },
        github: {
          release: true,
        },
      },
    });

    assert.deepEqual(pkg, expected);
  });

  QUnit.test('updates the changelog entry to ignore merge commits', async function(assert) {
    let premodificationPackageJSON = JSON.parse(project.toJSON('package.json'));

    await execa(BIN_PATH, ['--no-install', '--no-label-updates', '--no-changelog-merges']);

    let pkg = JSON.parse(fs.readFileSync('package.json', { encoding: 'utf8' }));
    let expected = mergePackageJSON(premodificationPackageJSON, {
      devDependencies: {
        'release-it': '^12.2.1',
        'release-it-lerna-changelog': '^1.0.3',
      },
      publishConfig: {
        registry: 'https://registry.npmjs.org',
      },
      'release-it': {
        plugins: {
          'release-it-lerna-changelog': {
            infile: 'CHANGELOG.md',
          },
        },
        git: {
          tagName: 'v${version}',
          changelog:
            'git log --pretty=format:"* %s (%h)" --no-merges --perl-regexp --author="^((?!dependabot-preview).*)$" ${latestTag}...HEAD',
        },
        github: {
          release: true,
        },
      },
    });

    assert.deepEqual(pkg, expected);
  });

  QUnit.test('installs dependencies', async function(assert) {
    await execa(BIN_PATH, ['--no-label-updates']);

    assert.ok(fs.existsSync('node_modules/release-it'), 'release-it installed');
    assert.ok(
      fs.existsSync('node_modules/release-it-lerna-changelog'),
      'release-it-lerna-changelog installed'
    );
  });

  QUnit.test('adds RELEASE.md to repo', async function(assert) {
    assert.notOk(fs.existsSync('RELEASE.md'), 'precond - RELEASE.md is not present');

    await execa(BIN_PATH, ['--no-install', '--no-label-updates']);

    assert.strictEqual(
      fs.readFileSync('RELEASE.md', { encoding: 'utf8' }),
      fs.readFileSync(path.join(__dirname, '..', 'RELEASE.md'), { encoding: 'utf8' }),
      'RELEASE.md was created with the correct contents'
    );
  });

  QUnit.module('--update', function(hooks) {
    hooks.beforeEach(async function() {
      await execa(BIN_PATH, ['--no-install', '--no-label-updates']);
    });

    QUnit.test('updates RELEASE.md', async function(assert) {
      fs.writeFileSync('RELEASE.md', 'lololol', 'utf8');

      await execa(BIN_PATH, ['--no-install', '--no-label-updates', '--update']);

      assert.strictEqual(
        fs.readFileSync('RELEASE.md', { encoding: 'utf8' }),
        fs.readFileSync(path.join(__dirname, '..', 'RELEASE.md'), { encoding: 'utf8' }),
        'RELEASE.md has the correct contents'
      );
    });
  });
});
