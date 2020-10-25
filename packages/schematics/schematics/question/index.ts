import { experimental, normalize, strings } from '@angular-devkit/core';
import { apply, applyTemplates, chain, mergeWith, move, Rule, Tree, url } from '@angular-devkit/schematics';
import { Schema as QuestionOptions } from './schema';

export function question(options: QuestionOptions): Rule {
    return (tree: Tree) => {
        const wsData = tree.read('angular.json');
        if (!wsData) {
            throw new Error('Could not find angular workspace.');
        }
        const workspace: experimental.workspace.WorkspaceSchema = JSON.parse(wsData.toString());
        const projectName = options.project || workspace.defaultProject!;
        const ptorConf = workspace.projects[projectName].architect!.e2e.options.protractorConfig;
        const featuresRoot = ptorConf.match(/(\w*\/)*/)[0];
        const template = apply(url('./files'), [
            applyTemplates({
                name: options.name,
                classify: strings.classify,
                dasherize: strings.dasherize,
            }),
            move(normalize(featuresRoot))]);
        return chain([mergeWith(template)]);
    }
}