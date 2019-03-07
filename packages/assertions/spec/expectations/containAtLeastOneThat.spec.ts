import 'mocha';

import { expect } from '@integration/testing-tools';
import { Actor, AssertionError, Question } from '@serenity-js/core';
import { containAtLeastOneThat, Ensure, equals, isGreaterThan } from '../../src';

describe('containAtLeastOneThat', () => {

    const Astrid = Actor.named('Astrid');

    /** @test {containAtLeastOneThat} */
    it(`allows for the actor flow to continue when the "actual" includes at least one item that meets the expectation`, () => {
        return Astrid.attemptsTo(
            Ensure.that([ 0, 1, 2 ], containAtLeastOneThat(isGreaterThan(1))),
        );
    });

    /** @test {containAtLeastOneThat} */
    it(`breaks the actor flow when "actual" does not include at least one item that meets the expectation`, () => {
        return expect(Astrid.attemptsTo(
            Ensure.that([ 0, 1, 2 ], containAtLeastOneThat(equals(7))),
        )).to.be.rejectedWith(AssertionError, `Expected [ 0, 1, 2 ] to contain at least one that does equal 7`);
    });

    /** @test {containAtLeastOneThat} */
    it(`breaks the actor flow when "actual" is an empty list`, () => {
        return expect(Astrid.attemptsTo(
            Ensure.that([], containAtLeastOneThat(equals(42))),
        )).to.be.rejectedWith(AssertionError, `Expected [ ] to contain at least one that does equal 42`);
    });

    /** @test {atLeastOne} */
    it(`contributes to a human-readable description`, () => {
        const numbers = () => Question.about('list of numbers', actor => [ 0, 1, 2 ]);

        expect(Ensure.that(numbers(), containAtLeastOneThat(isGreaterThan(1))).toString())
            .to.equal(`#actor ensures that list of numbers does contain at least one that does have value greater than 1`);
    });
});
