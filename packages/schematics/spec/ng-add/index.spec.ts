import { experimental } from '@angular-devkit/core';
// tslint:disable-next-line: no-submodule-imports
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { expect } from 'chai';

// tslint:disable: no-unused-expression
describe('Angular CLI Schematic', () => {
    const testRunner = new SchematicTestRunner('@serenity-js/schematics', require.resolve('../../schematics/collection.json'));
    let appTree: UnitTestTree

    beforeEach(async () => {
        const workspaceOptions = { name: 'testspace', newProjectRoot: 'projects', version: '8.0.0' };

        const workspaceTree = await testRunner.runExternalSchematicAsync('@schematics/angular', 'workspace', workspaceOptions).toPromise();
        appTree = await testRunner.runExternalSchematicAsync('@schematics/angular', 'application', { name: 'defaultApp' }, workspaceTree).toPromise();
        appTree = await testRunner.runExternalSchematicAsync('@schematics/angular', 'application', { name: 'testApp' }, workspaceTree).toPromise();
    });

    it('adds the core serenity libraries as devDeps to an angular app', async () => {
        const tree = await testRunner.runSchematicAsync('ng-add', {}, appTree).toPromise();
        const packageJson = JSON.parse(tree.readContent('./package.json'));
        expect(packageJson.devDependencies['@serenity-js/assertions']).to.exist;
        expect(packageJson.devDependencies['@serenity-js/console-reporter']).to.exist;
        expect(packageJson.devDependencies['@serenity-js/core']).to.exist;
        expect(packageJson.devDependencies['@serenity-js/serenity-bdd']).to.exist;
        expect(packageJson.devDependencies['ts-node']).to.exist;
    });

    it('scaffolds the creation of actors in the default project', async () => {
        const tree = await testRunner.runSchematicAsync('ng-add', {}, appTree).toPromise();
        expect(tree.exists('/projects/default-app/features/screenplay/actors.ts')).to.be.true;
    });

    it('adds the dev dependencies for protractor to the default project by default', async () => {
        const tree = await testRunner.runSchematicAsync('ng-add', {}, appTree).toPromise();
        const packageJson = JSON.parse(tree.readContent('package.json'));
        expect(packageJson.devDependencies['@serenity-js/protractor']).to.exist;
        expect(packageJson.devDependencies.protractor).to.exist;
    });

    it('adds the dev dependencies for cucumber to the default project by default', async () => {
        const tree = await testRunner.runSchematicAsync('ng-add', {}, appTree).toPromise();
        const packageJson = JSON.parse(tree.readContent('package.json'));
        expect(packageJson.devDependencies['@serenity-js/cucumber']).to.exist;
        expect(packageJson.devDependencies['@types/cucumber']).to.exist;
        expect(packageJson.devDependencies.cucumber).to.exist;
    });

    it('adds the protractor config file to the e2e test config of the default project', async () => {
        const tree = await testRunner.runSchematicAsync('ng-add', {}, appTree).toPromise();
        const ptrConf = tree.readContent('/projects/default-app/features/protractor.conf.js');
        expect(ptrConf.includes('serenity: ')).to.be.true;
    });

    it('adds the protractor config file to the e2e test config of the specified project', async () => {
        const options = { project: 'testApp' };
        const tree = await testRunner.runSchematicAsync('ng-add', options, appTree).toPromise();
        const ptrConf = tree.readContent('/projects/test-app/features/protractor.conf.js');
        expect(ptrConf.includes('serenity: ')).to.be.true;
    });

    it('adds the cucumber configuration to the protractor config in the default project', async () => {
        const tree = await testRunner.runSchematicAsync('ng-add', {}, appTree).toPromise();
        const ptrConf = tree.readContent('/projects/default-app/features/protractor.conf.js');
        expect(ptrConf.includes('cucumberOpts: ')).to.be.true;
    });

    it('scaffolds the configuration of cucumber timeouts in the default project', async () => {
        const tree = await testRunner.runSchematicAsync('ng-add', {}, appTree).toPromise();
        expect(tree.exists('/projects/default-app/features/support/setup.ts')).to.be.true;
    });

    it('updates the e2e directory in the angular workspace', async () => {
        const tree = await testRunner.runSchematicAsync('ng-add', {}, appTree).toPromise();
        const workspace: experimental.workspace.WorkspaceSchema = JSON.parse(tree.readContent('./angular.json'));
        expect(workspace.projects.defaultApp.architect!.lint.options.tsConfig).not.to.include('projects/default-app/e2e/tsconfig.json');
        expect(workspace.projects.defaultApp.architect!.lint.options.tsConfig).to.include('projects/default-app/features/tsconfig.json');
        expect(workspace.projects.defaultApp.architect!.e2e.options.protractorConfig.startsWith('projects/default-app/features')).to.be.true;
    });
});
// tslint:enable: no-unused-expression