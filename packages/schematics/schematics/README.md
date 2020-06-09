# Serenity/JS
[Serenity/JS](https://serenity-js.org) is a Node.js library designed to make acceptance and regression testing
of modern full-stack applications faster, more collaborative and easier to scale.

## Serenity/JS Schematics

The `@serenity-js/schematics` module provides Angular schematics for installation and setup of Serenity/JS.

### Installation

Run `ng add @serenity-js/schematics` to setup serenity-js for the default project in your workspace.

The add schematic supports the following options

| Option | |
| -- | -- |
| --project | the project in the angular workspace for which Serenity/JS should be configured. Defaults to the `defaultProject` |
| --directory | the directory where the e2e testcode resides. Defaults to `features` |
| --testFramework | the tesing framework to use with serenity. Currently only `Cucumber` |  
| --browserIntegrationFramework | the framework to use for browser automation. Currently only `Protractor` |