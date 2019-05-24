const Project = require('fixturify-project');
const ROOT = process.cwd();

QUnit.module('main binary', function(hooks) {
  let project;

  hooks.beforeEach(function() {
    project = new Project('some-thing-cool', '0.1.0');
  });

  hooks.afterEach(function() {
    process.chdir(ROOT);
  });

  QUnit.todo('adds devDependencies to package.json', function() {});
  QUnit.todo('adds CHANGELOG.md file', function() {});
  QUnit.todo('removes any default header from pre-existing CHANGELOG.md', function() {});
  QUnit.todo('adds release-it config to package.json', function() {});
});
