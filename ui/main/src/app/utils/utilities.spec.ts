/* Copyright (c) 2023-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Utilities} from './utilities';

describe('Utilities', () => {
    describe('compareObj', () => {
        it('should compare two strings correctly', () => {
            const str1 = 'apple';
            const str2 = 'banana';
            const result = Utilities.compareObj(str1, str2);
            expect(result).toBe(-1);
        });

        it('should compare two numbers correctly', () => {
            const num1 = 10;
            const num2 = 5;
            const result = Utilities.compareObj(num1, num2);
            expect(result).toBe(1);
        });

        it('should compare two equal objects correctly', () => {
            const obj1 = {key: 'value'};
            const obj2 = {key: 'value'};
            const result = Utilities.compareObj(obj1, obj2);
            expect(result).toBe(0);
        });

        it('should compare two strings with emojis correctly', () => {
            const str1 = 'Hello, world! 😊';
            const str2 = 'Hello, world!';
            const result = Utilities.compareObj(str1, str2);
            expect(result).toBe(0);
        });
    });

    describe('sliceForFormat', () => {
        it('should return the original string when its length is less than or equal to the number of characters to keep', () => {
            const str = 'Hello';
            const charactersToKeep = 5;
            const result = Utilities.sliceForFormat(str, charactersToKeep);
            expect(result).toEqual('Hello');
        });

        it('should return a sliced string with "..." appended when its length is greater than the number of characters to keep', () => {
            const str = 'Hello, world!';
            const charactersToKeep = 5;
            const result = Utilities.sliceForFormat(str, charactersToKeep);
            expect(result).toEqual('Hello...');
        });
    });

    describe('removeElementsFromArray', () => {
        it('should remove specified elements from the array', () => {
            const arrayToFilter = ['apple', 'banana', 'cherry'];
            const arrayToDelete = ['banana'];
            const result = Utilities.removeElementsFromArray(arrayToFilter, arrayToDelete);
            expect(result).toEqual(['apple', 'cherry']);
        });

        it('should return the original array when no elements to delete are specified', () => {
            const arrayToFilter = ['apple', 'banana', 'cherry'];
            const arrayToDelete = [];
            const result = Utilities.removeElementsFromArray(arrayToFilter, arrayToDelete);
            expect(result).toEqual(['apple', 'banana', 'cherry']);
        });

        it('should return the original array when elements to delete are not found in the array', () => {
            const arrayToFilter = ['apple', 'banana', 'cherry'];
            const arrayToDelete = ['orange'];
            const result = Utilities.removeElementsFromArray(arrayToFilter, arrayToDelete);
            expect(result).toEqual(['apple', 'banana', 'cherry']);
        });
    });
});
