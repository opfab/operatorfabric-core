/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {extractNameWithVersionAndSortByRank} from './about.component';

describe('extractNamesWithVersionAndSortByRank', () => {

    it('should order applications by rank if they are all declared without duplicate', () => {
        const first = {name: 'first', version: 'first version', rank: 0};
        const second = {name: 'second', version: 'second version', rank: 1};
        const third = {name: 'third', version: 'third version', rank: 2};
        const applications = {third: third, second: second, first: first};

        const sortedApplications = extractNameWithVersionAndSortByRank(applications);
        expect(sortedApplications).toEqual([first, second, third]);
    });
    it('should leave the initial order if all application reference have the same rank', () => {
        const first = {name: 'aaaa', version: 'v1', rank: 0};
        const second = {name: 'bbbb', version: 'v2', rank: 0};
        const third = {name: 'ccc', version: 'v3', rank: 0};
        const applications = {  first: first, second: second, third: third};

        const sortedApplications = extractNameWithVersionAndSortByRank(applications);
        expect(sortedApplications).toEqual([first, second, third]);
    });
    it('should order applications by rank and then the ones without rank in declared order', () => {
        const first = {name: 'aaaa', version: 'v1', rank: 0};
        const second = {name: 'bbbb', version: 'v2', rank: 12};
        const third = {name: 'ccc', version: 'v3'};
        const forth = {name: 'eeee', version: 'v'};
        const applications = {second: second, first: first, third: third, forth: forth};

        const sortedApplications = extractNameWithVersionAndSortByRank(applications);
        expect(sortedApplications).toEqual([first, second, third, forth]);
    });
    it('should leave initial order if no rank declare at all', () => {
        const first = {name: 'aaaa', version: 'v1'};
        const second = {name: 'bbbb', version: 'v2'};
        const third = {name: 'ccc', version: 'v3'};
        const applications = {first: first, second: second, third: third};

        const sortedApplications = extractNameWithVersionAndSortByRank(applications);
        expect(sortedApplications).toEqual([first, second, third]);
    });

    it('should order applications by rank and then places the one with duplicate or without rank in their initial order', () => {
        const first = {name: 'aaaa', version: 'v1', rank: 0};
        const second = {name: 'bbbb', version: 'v2', rank: 1};
        const third = {name: 'ccc', version: 'v3', rank: 2};
        const forth = {name: 'eeee', version: 'v', rank: 2};
        const fifth = {name: 'fff', version: '3'};
        const sixth = {name: 'jjj', version: '7'};
        const applications = {third: third, second: second, forth: forth, fifth: fifth, sixth: sixth, first: first};

        const sortedApplications = extractNameWithVersionAndSortByRank(applications);
        expect(sortedApplications).toEqual([first, second, third, forth, fifth, sixth]);
    });
});
