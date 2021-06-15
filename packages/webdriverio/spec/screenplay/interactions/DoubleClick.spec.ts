import 'mocha';

import { expect } from '@integration/testing-tools';
import { Ensure, equals } from '@serenity-js/assertions';
import { actorCalled } from '@serenity-js/core';

import { by, DoubleClick, Navigate, Target, Text } from '../../../src';

describe('DoubleClick', () => {

    const Interactive_Element = Target.the('interactive element').located(by.id('double-click-me'));

    /** @test {DoubleClick} */
    /** @test {DoubleClick.on} */
    it('allows the actor to clear the value of a field', () =>
        actorCalled('Bernie').attemptsTo(
            Navigate.to('/screenplay/interactions/double-click/example.html'),

            DoubleClick.on(Interactive_Element),

            Ensure.that(Text.of(Interactive_Element), equals('done!')),
        ));

    /** @test {DoubleClick#toString} */
    it('provides a sensible description of the interaction being performed', () => {
        expect(DoubleClick.on(Interactive_Element).toString())
            .to.equal('#actor double-clicks on the interactive element');
    });
});
