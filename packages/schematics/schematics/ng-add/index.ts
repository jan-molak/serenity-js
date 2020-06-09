// tslint:disable: no-implicit-dependencies reason: @angult-devkit/schematics is an optional dependency
import { experimental, join, normalize } from '@angular-devkit/core';
import { MergeStrategy, Rule, SchematicContext, SchematicsException, Tree, apply, applyTemplates, chain, mergeWith, move, noop, url } from '@angular-devkit/schematics';
// tslint:disable-next-line: no-submodule-imports reason: see official docs at https://angular.io/guide/schematics-for-libraries#providing-installation-support
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';
import { Schema as SerenityJsAddOptions } from './schema';
// tslint:enable: no-implicit-dependencies

interface Indexer {
    [key: string]: string | number | Indexer | boolean;
}

function addNodeToJson(sourceNode: Indexer, key: string, value: string | Indexer) {
    if (sourceNode[key] === undefined){
        sourceNode[key] = value;
    }
    return sourceNode
}

function getProjectRootPath(tree: Tree, project: string): string {
    let protractorConfigPath = project;
    const buffer = tree.read('./angular.json');
    if (!buffer) {
        throw new SchematicsException('Could not find angular workspace.');
    }
    const workspace: experimental.workspace.WorkspaceSchema = JSON.parse(buffer.toString('utf-8'));
    let ngProject: experimental.workspace.WorkspaceProject;
    if (project === '.' && workspace.defaultProject) {
        ngProject = workspace.projects[workspace.defaultProject!];
    } else {
        if (!workspace.projects[project!]) {
            throw new SchematicsException(`Could not find project ${project}`)
        }
        ngProject = workspace.projects[project!];
    }
    protractorConfigPath = ngProject.root ? ngProject.root : '.';
    return protractorConfigPath
}

function configureProtractor(options: SerenityJsAddOptions) {
    return (tree: Tree, context: SchematicContext) => {
        context.logger.info('installing and configuring protractor');
        const buffer = tree.read('./package.json');
        if (buffer === null) {
            throw new SchematicsException('Could not find package.json');
        }
        let packageJson = JSON.parse(buffer.toString('utf-8')) as Indexer;
        packageJson = addNodeToJson(packageJson, 'devDependencies', {});
        packageJson.devDependencies = addNodeToJson(packageJson.devDependencies as Indexer, 'protractor', '^7.0.0');
        packageJson.devDependencies = addNodeToJson(packageJson.devDependencies, '@serenity-js/protractor', '^2.0.0');
        tree.overwrite('./package.json', JSON.stringify(packageJson, null, 2));
        context.addTask(new NodePackageInstallTask());
        const projectRoot = getProjectRootPath(tree, options.project!);
        const e2eDir = tree.getDir(`${projectRoot}/e2e`) ?
            normalize(`${projectRoot}/e2e`) :
            join(normalize(projectRoot), 'e2e');
        const protractorConfig = apply(url('./files/protractor'), [
            applyTemplates({
                testFramework: options.testFramework
            }),
            move(e2eDir)
          ]);
        return mergeWith(protractorConfig, MergeStrategy.Overwrite);
    }
}

function configureCucumber(options: SerenityJsAddOptions): Rule {
    return (tree: Tree, context: SchematicContext) => {
        context.logger.info('installing and configuring cucumber');
        const buffer = tree.read('./package.json');
        if (buffer === null) {
            throw new SchematicsException('Could not find package.json');
        }
        let packageJson = JSON.parse(buffer.toString('utf-8')) as Indexer;
        packageJson = addNodeToJson(packageJson, 'devDependencies', {});
        packageJson.devDependencies = addNodeToJson(packageJson.devDependencies as Indexer, 'cucumber', '^6.0.0');
        packageJson.devDependencies = addNodeToJson(packageJson.devDependencies, '@types/cucumber', '^6.0.0');
        packageJson.devDependencies = addNodeToJson(packageJson.devDependencies, '@serenity-js/cucumber', '^2.0.0');
        tree.overwrite('./package.json', JSON.stringify(packageJson, null, 2));
        context.addTask(new NodePackageInstallTask());
        const projectRoot = getProjectRootPath(tree, options.project!);
        const e2eDir = tree.getDir(`${projectRoot}/e2e`) ?
            normalize(`${projectRoot}/e2e`) :
            join(normalize(projectRoot), 'e2e');
        const cucumberSource = apply(url('./files/cucumber'), [
            applyTemplates({ }),
            move(e2eDir)
        ]);
        return mergeWith(cucumberSource);
    };
}

function configureSerenity(options: SerenityJsAddOptions): Rule {
    return (tree: Tree, context: SchematicContext) => {
        context.logger.info('installing serenity-js');
        const buffer = tree.read('./package.json');
        if (buffer === null) {
            throw new SchematicsException('Could not find package.json');
        }
        let packageJson = JSON.parse(buffer.toString('utf-8')) as Indexer;
        packageJson = addNodeToJson(packageJson, 'devDependencies', {});
        packageJson.devDependencies = addNodeToJson(packageJson.devDependencies as Indexer, '@serenity-js/assertions', '^2.0.0');
        packageJson.devDependencies = addNodeToJson(packageJson.devDependencies, '@serenity-js/console-reporter', '^2.0.0');
        packageJson.devDependencies = addNodeToJson(packageJson.devDependencies, '@serenity-js/serenity-bdd', '^2.0.0');
        packageJson.devDependencies = addNodeToJson(packageJson.devDependencies, '@serenity-js/core', '^2.0.0');
        packageJson.devDependencies = addNodeToJson(packageJson.devDependencies, 'ts-node', '^8.10.2');
        tree.overwrite('./package.json', JSON.stringify(packageJson, null, 2));
        context.addTask(new NodePackageInstallTask());
        const projectRoot = getProjectRootPath(tree, options.project!);
        const e2eDir = tree.getDir(`${projectRoot}/e2e`) ?
            normalize(`${projectRoot}/e2e`) :
            join(normalize(projectRoot), 'e2e');
        const serenitySource = apply(url('./files/serenity-js'), [
            applyTemplates({ }),
            move(e2eDir)
        ]);
        return mergeWith(serenitySource);
    };
}

function updateAngularWorkspace(options: SerenityJsAddOptions): Rule {
    return (tree: Tree, context: SchematicContext) => {
        let rule = noop();
        const buffer = tree.read('./angular.json');
        if (!buffer) {
            throw new SchematicsException('Could not find angular workspace.')
        }
        context.logger.info('updating angular workspace');
        const workspace: experimental.workspace.WorkspaceSchema = JSON.parse(buffer.toString('utf-8'));
        const project = options.project! === '.' && workspace.defaultProject ?
            workspace.projects[workspace.defaultProject] :
            workspace.projects[options.project!]
        if (!project) {
            throw new SchematicsException(`Could not find project ${options.project!}`);
        }
        if (project.architect?.e2e) {
            project.architect!.e2e.options.protractorConfig = project.architect!.e2e.options.protractorConfig.replace(/e2e/, `${options.directory!}`);
            if (project.architect?.lint) {
                project.architect!.lint.options.tsConfig = project.architect!.lint.options.tsConfig.map((tsconfig: string) => tsconfig.replace(/e2e/, `${options.directory!}`));
            }
            tree.overwrite('./angular.json', JSON.stringify(workspace, null, 2));
            rule = move(normalize(`${project.root}/e2e`), normalize(`${project.root}/${options.directory!}`));
        }
        return rule;
    }
}

export function ngAdd(options: SerenityJsAddOptions): Rule {
    const defaultOptions = {
        project: '.',
        directory: 'features',
        browserIntegrationFramework: 'protractor',
        testFramework: 'cucumber' };
    const effectiveOptions = { ...defaultOptions, ...options };
    return (tree: Tree, context: SchematicContext) => {
        context.logger.info('setting up serenity-js');
        tree.exists(tree.root.path);
        let protractorConfigRule = noop();
        let cucumberConfigRule = noop();

        if (effectiveOptions.browserIntegrationFramework === 'protractor') {
            protractorConfigRule = configureProtractor(effectiveOptions);
        }
        if (effectiveOptions.testFramework === 'cucumber') {
            cucumberConfigRule = configureCucumber(effectiveOptions);
        }
        return chain([
            configureSerenity(effectiveOptions),
            protractorConfigRule,
            cucumberConfigRule,
            updateAngularWorkspace(effectiveOptions)
        ]);
    }
}