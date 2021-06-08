import { AssertionError } from '@serenity-js/core';
import { TableDefinition } from 'cucumber';

export = function (): void {
    this.Given(/^.*step .* passes$/, function () {
        return Promise.resolve();
    });

    this.Given(/^.*step .* fails with generic error$/, function () {
        return Promise.reject(new Error(`Something's wrong`));
    });

    this.Given(/^.*step .* fails with assertion error$/, function () {
        return Promise.reject(new AssertionError(`Expected false to equal true`, false, true));
    });

    this.Given(/^.*step .* marked as pending/, function () {
        return Promise.resolve('pending');
    });

    this.Given(/^.*step .* receives a table:$/, function (data: TableDefinition) {
        return Promise.resolve();
    });

    this.Given(/^.*step .* receives a doc string:$/, function (docstring: string) {
        return Promise.resolve();
    });

    this.Given(/^.*step that times out$/, { timeout: 100 }, function () {
        return new Promise((resolve, reject) => {
            setTimeout(resolve, 1000);
        });
    });
};
