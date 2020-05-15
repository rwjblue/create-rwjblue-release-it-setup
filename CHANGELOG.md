## v2.8.0 (2020-05-15)

#### :rocket: Enhancement
* [#91](https://github.com/rwjblue/create-rwjblue-release-it-setup/pull/91) Avoid setting launchEditor if no $EDITOR is setup. ([@rwjblue](https://github.com/rwjblue))
* [#90](https://github.com/rwjblue/create-rwjblue-release-it-setup/pull/90) Attempt to populate `repository` info from `.git/config` ([@rwjblue](https://github.com/rwjblue))
* [#87](https://github.com/rwjblue/create-rwjblue-release-it-setup/pull/87) Bump release-it from 13.5.8 to 13.6.0 ([@dependabot-preview[bot]](https://github.com/apps/dependabot-preview))
* [#86](https://github.com/rwjblue/create-rwjblue-release-it-setup/pull/86) Bump github-label-sync from 1.5.0 to 1.6.0 ([@dependabot-preview[bot]](https://github.com/apps/dependabot-preview))

#### :house: Internal
* [#89](https://github.com/rwjblue/create-rwjblue-release-it-setup/pull/89) Tweak CI setup a bit. ([@rwjblue](https://github.com/rwjblue))
* [#88](https://github.com/rwjblue/create-rwjblue-release-it-setup/pull/88) Convert to Jest ([@rwjblue](https://github.com/rwjblue))

#### Committers: 2
- Robert Jackson ([@rwjblue](https://github.com/rwjblue))
- [@dependabot-preview[bot]](https://github.com/apps/dependabot-preview)


## v2.7.0 (2020-04-28)

#### :rocket: Enhancement
* [#77](https://github.com/rwjblue/create-rwjblue-release-it-setup/pull/77) Update release-it-yarn-workspaces to 1.4.0. ([@rwjblue](https://github.com/rwjblue))
* [#75](https://github.com/rwjblue/create-rwjblue-release-it-setup/pull/75) Bump release-it-lerna-changelog from 2.2.0 to 2.3.0 ([@dependabot-preview[bot]](https://github.com/apps/dependabot-preview))

#### Committers: 2
- Robert Jackson ([@rwjblue](https://github.com/rwjblue))
- [@dependabot-preview[bot]](https://github.com/apps/dependabot-preview)


## v2.6.0 (2020-04-03)

#### :rocket: Enhancement

* Upgrade release-it-yarn-workspaces to 1.3.0
* Update release-it to 13.5.1

## v2.5.0 (2020-03-30)

#### :rocket: Enhancement
* [#52](https://github.com/rwjblue/create-rwjblue-release-it-setup/pull/52) Add release-it config to disable npm for private packages. ([@rwjblue](https://github.com/rwjblue))

#### Committers: 1
- Robert Jackson ([@rwjblue](https://github.com/rwjblue))


## v2.4.0 (2020-03-30)

#### :rocket: Enhancement
* [#51](https://github.com/rwjblue/create-rwjblue-release-it-setup/pull/51) Update release-it-yarn-workspaces to prompt for access control with scoped packages (if needed). ([@rwjblue](https://github.com/rwjblue))

#### Committers: 1
- Robert Jackson ([@rwjblue](https://github.com/rwjblue))


## v2.3.0 (2020-03-30)

#### :rocket: Enhancement
* [#47](https://github.com/rwjblue/create-rwjblue-release-it-setup/pull/47) Bump release-it to 13.3.2 ([@dependabot-preview[bot]](https://github.com/apps/dependabot-preview))
* [#49](https://github.com/rwjblue/create-rwjblue-release-it-setup/pull/49) Bump release-it-lerna-changelog to 2.1.2 ([@dependabot-preview[bot]](https://github.com/apps/dependabot-preview))
* [#48](https://github.com/rwjblue/create-rwjblue-release-it-setup/pull/48) Add release-it-yarn-workspaces when ran within a monorepo. ([@rwjblue](https://github.com/rwjblue))

#### :house: Internal
* [#43](https://github.com/rwjblue/create-rwjblue-release-it-setup/pull/43) Update prettier to 2.0. ([@rwjblue](https://github.com/rwjblue))

#### Committers: 2
- Robert Jackson ([@rwjblue](https://github.com/rwjblue))
- [@dependabot-preview[bot]](https://github.com/apps/dependabot-preview)


## v2.2.1 (2020-03-23)

#### :bug: Bug Fix
* [#42](https://github.com/rwjblue/create-rwjblue-release-it-setup/pull/42) Fixes bug in logic with --labels-only ([@scalvert](https://github.com/scalvert))

#### Committers: 2
- Steve Calvert ([@scalvert](https://github.com/scalvert))
- [@dependabot-preview[bot]](https://github.com/apps/dependabot-preview)


## v2.2.0 (2020-03-19)

#### :rocket: Enhancement
* [#38](https://github.com/rwjblue/create-rwjblue-release-it-setup/pull/38) Update release-it-lerna-changelog minimum version. Ensures changelog presented _before_ version selection is from `lerna-changelog`. ([@rwjblue](https://github.com/rwjblue))

#### :bug: Bug Fix
* [#37](https://github.com/rwjblue/create-rwjblue-release-it-setup/pull/37) Ensure existing `release-it` config is preserved. ([@rwjblue](https://github.com/rwjblue))
* [#36](https://github.com/rwjblue/create-rwjblue-release-it-setup/pull/36) Avoid downgrading release-it / release-it-lerna-changelog. ([@rwjblue](https://github.com/rwjblue))
* [#35](https://github.com/rwjblue/create-rwjblue-release-it-setup/pull/35) Avoid deleting existing GitHub labels when adding new ones. ([@rwjblue](https://github.com/rwjblue))
* [#32](https://github.com/rwjblue/create-rwjblue-release-it-setup/pull/32) Correctly parse repo information. ([@rwjblue](https://github.com/rwjblue))

#### Committers: 2
- Robert Jackson ([@rwjblue](https://github.com/rwjblue))
- [@dependabot-preview[bot]](https://github.com/apps/dependabot-preview)


## v2.1.1 (2020-03-12)

#### :bug: Bug Fix
* [#30](https://github.com/rwjblue/create-rwjblue-release-it-setup/pull/30) Ensure release-template.md is published with the project. ([@rwjblue](https://github.com/rwjblue))

#### Committers: 1
- Robert Jackson ([@rwjblue](https://github.com/rwjblue))


## v2.1.0 (2020-03-10)

#### :rocket: Enhancement
* [#29](https://github.com/rwjblue/create-rwjblue-release-it-setup/pull/29) Ensure `RELEASE.md` mentions `yarn install` or `npm install` appropriately. ([@rwjblue](https://github.com/rwjblue))

#### Committers: 1
- Robert Jackson ([@rwjblue](https://github.com/rwjblue))


## v2.0.0 (2020-03-10)

#### :boom: Breaking Change
* [#16](https://github.com/rwjblue/create-rwjblue-release-it-setup/pull/16) Drop Node 8 support. ([@rwjblue](https://github.com/rwjblue))

#### :rocket: Enhancement
* [#28](https://github.com/rwjblue/create-rwjblue-release-it-setup/pull/28) Enable `release-it-lerna-changelog`s `launchEditor` feature. ([@rwjblue](https://github.com/rwjblue))
* [#27](https://github.com/rwjblue/create-rwjblue-release-it-setup/pull/27) Ensure generated devDependencies match those used for testing. ([@rwjblue](https://github.com/rwjblue))
* [#18](https://github.com/rwjblue/create-rwjblue-release-it-setup/pull/18) Update dependencies / devDependencies to latest. ([@rwjblue](https://github.com/rwjblue))
* [#17](https://github.com/rwjblue/create-rwjblue-release-it-setup/pull/17) Ensure label sync uses same token as release-it and lerna-changelog. ([@rwjblue](https://github.com/rwjblue))
* [#15](https://github.com/rwjblue/create-rwjblue-release-it-setup/pull/15) Use the same GitHub access token for both `release-it` and `lerna-changelog` ([@jelhan](https://github.com/jelhan))

#### Committers: 3
- Jeldrik Hanschke ([@jelhan](https://github.com/jelhan))
- Robert Jackson ([@rwjblue](https://github.com/rwjblue))
- Robert Wagner ([@rwwagner90](https://github.com/rwwagner90))


## v1.3.0 (2019-08-12)

#### :rocket: Enhancement
* [#10](https://github.com/rwjblue/create-rwjblue-release-it-setup/pull/10) Add --update flag. ([@rwjblue](https://github.com/rwjblue))

#### Committers: 1
- Robert Jackson ([@rwjblue](https://github.com/rwjblue))

## v1.2.0 (2019-08-12)

#### :rocket: Enhancement
* [#7](https://github.com/rwjblue/create-rwjblue-release-it-setup/pull/7) Add basic error logging. ([@rwjblue](https://github.com/rwjblue))

#### :bug: Bug Fix
* [#9](https://github.com/rwjblue/create-rwjblue-release-it-setup/pull/9) Remove `release` script from `package.json`. ([@rwjblue](https://github.com/rwjblue))

#### :memo: Documentation
* [#8](https://github.com/rwjblue/create-rwjblue-release-it-setup/pull/8) Refactor `RELEASE.md` to mention global install of `release-it`. ([@rwjblue](https://github.com/rwjblue))

#### Committers: 1
- Robert Jackson ([@rwjblue](https://github.com/rwjblue))

## v1.1.1 (2019-06-04)

#### :bug: Bug Fix
* [#5](https://github.com/rwjblue/create-rwjblue-release-it-setup/pull/5) Add RELEASE.md to files listing. ([@rwjblue](https://github.com/rwjblue))

#### Committers: 1
- Robert Jackson ([@rwjblue](https://github.com/rwjblue))

## v1.1.0 (2019-06-04)

#### :rocket: Enhancement
* [#2](https://github.com/rwjblue/create-rwjblue-release-it-setup/pull/2) Add GitHub Label Sync setup. ([@rwjblue](https://github.com/rwjblue))
* [#1](https://github.com/rwjblue/create-rwjblue-release-it-setup/pull/1) Automatically add a RELEASE.md file to the repo. ([@rwjblue](https://github.com/rwjblue))

#### Committers: 1
- Robert Jackson ([@rwjblue](https://github.com/rwjblue))



