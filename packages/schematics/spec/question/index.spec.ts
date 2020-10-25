// tslint:disable-next-line: no-submodule-imports
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { expect } from 'chai';

describe('Serenity/JS Schematic', () => {
    describe('generate Question', () => {
        const testRunner = new SchematicTestRunner('@serenity-js/schematics', require.resolve('../../schematics/collection.json'));
        let testTree: UnitTestTree;

        beforeEach(async () => {
            const workspaceOptions = { name: 'testspace', newProjectRoot: 'projects', version: '8.0.0' };
            const wsTree = await testRunner.runExternalSchematicAsync('@schematics/angular', 'workspace', workspaceOptions).toPromise();
            const appTree = await testRunner.runExternalSchematicAsync('@schematics/angular', 'application', { name: 'app'}, wsTree).toPromise();
            testTree = await testRunner.runSchematicAsync('ng-add', {}, appTree).toPromise();
        });

        it('should scaffold a question into the screenplay folder', async () => {
            const resultTree = await testRunner.runSchematicAsync('question', { name: 'testQuestion' }, testTree).toPromise();
            expect(resultTree.files).to.include('/projects/app/features/screenplay/test-question.question.ts');
        });

        it('should replace and format file content correctly', async () => {
            const resultTree = await testRunner.runSchematicAsync('question', { name: 'testQuestion'}, testTree).toPromise();
            const question = resultTree.readContent('/projects/app/features/screenplay/test-question.question.ts');
            expect(question).to.match(/export const TestQuestion = \(\) =>/s);
        });
    });
});