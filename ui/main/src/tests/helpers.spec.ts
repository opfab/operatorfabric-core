/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    appendFixedLengthAlphanumericValue,
    generateRandomPositiveIntegerWithinRangeWithOneAsMinimum, getOneRandomCardDetail, getOneRandomCardWithRandomDetails,
    getRandomAlphanumericValue, pickARandomItemOfAnEnum
} from './helpers';
import {TitlePosition} from "@ofModel/card.model";
import {Title} from "@angular/platform-browser";

// most of max and min value used here have been chosen arbitrarily

describe('Tests Helpers', () => {

    describe(' appenFixedLenghtAlphanumericValue', () => {
        it('should generate a string with one character at least', () => {
            const result = appendFixedLengthAlphanumericValue();
            expect(result.length).toEqual(1);
        });
        it('should generate a requested length string', () => {
            const maximumLength = 34;
            const minimalLength = 7;
            const requestLength = generateRandomPositiveIntegerWithinRangeWithOneAsMinimum(minimalLength, maximumLength);
            const result = appendFixedLengthAlphanumericValue(requestLength);
            expect(result.length).toEqual(requestLength);
        });

        it('should begin with the base string', () => {
            const requestedLength = generateRandomPositiveIntegerWithinRangeWithOneAsMinimum(5, 12);
            const result = appendFixedLengthAlphanumericValue(requestedLength, 'AAA');
            expect(result).toContain('AAA');
        });
    });
    describe('getRandomAlphanumericValue', () => {
        it('should return one character when no args provide ', () => {
            const result = getRandomAlphanumericValue();
            expect(result.length).toEqual(1);
        });
        it('should return one character when a negative Number is provided ', () => {
            const result = getRandomAlphanumericValue(-12);
            expect(result.length).toEqual(1);
        });
        it('should return one character when two negative number are provided ', () => {
            const result = getRandomAlphanumericValue(-12, -45);
            expect(result.length).toEqual(1);
        });
        it('should return a string with one char minimum and at max minimimal ' +
            'when a minimal length is provided ', () => {
            const minimalLengthRequested = 5;
            const result = getRandomAlphanumericValue(minimalLengthRequested);
            const resultLength = result.length;
            expect(resultLength).toBeGreaterThanOrEqual(1);
            expect(resultLength).toBeLessThanOrEqual(minimalLengthRequested);
        });
        it('should return a string with one char minimum and at max minimimal ' +
            'when a minimal length is provided and a maximum length lesser than minimum', () => {
            const minimalLengthRequested = 12;
            const maximalLengthRequested = 2;
            const result = getRandomAlphanumericValue(minimalLengthRequested, maximalLengthRequested);
            const resultLength = result.length;
            expect(resultLength).toBeGreaterThanOrEqual(1);
            expect(resultLength).toBeLessThanOrEqual(minimalLengthRequested);
        });
        it('should return a string with length include between minimal and maximum length requested', () => {
            const minimalLengthRequested = 8;
            const maximalLengthRequested = 23;
            const result = getRandomAlphanumericValue(minimalLengthRequested, maximalLengthRequested);
            const resultLength = result.length;
            expect(resultLength).toBeGreaterThanOrEqual(minimalLengthRequested);
            expect(resultLength).toBeLessThanOrEqual(maximalLengthRequested);
        });

    });
    describe('pickARandomItemOfAnEnume', () => {

        it('should return one element of a given Enum', () => {
            for (let i = 0; i < 10; ++i) {
                let randomEnumElement = pickARandomItemOfAnEnum(TitlePosition);
                expect(Object.values(TitlePosition).includes(randomEnumElement)).toEqual(true);
            }
        });
    });
    describe('getOneRandomCardDetail',()=>{
        it('should create one cardDetail', () =>{
        const oddCardDetail = getOneRandomCardDetail();
        expect(oddCardDetail).toBeTruthy();
        });
    });
    describe('getOneRandomCardWithRandomDetails', () =>{
       it('should create one card with details over min and under max', () =>{
          const randomCard = getOneRandomCardWithRandomDetails(7,11);
               expect(randomCard).toBeTruthy();
               let detailNumber = randomCard.details.length;
               expect(detailNumber).toBeGreaterThanOrEqual(7);
               expect(detailNumber).toBeLessThanOrEqual(11);

       }
       ) ;
    });
});
