/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {AppState} from '@ofStore/index';
import {archiveInitialState, ArchiveState} from '@ofStates/archive.state';
import { selectArchiveFilters} from '@ofSelectors/archive.selectors';
import { DateTimeNgb } from '@ofModel/datetime-ngb.model';

describe('ArchiveSelectors', () => {
    const emptyAppState: AppState = {
        router: null,
        feed: null,
        timeline: null,
        authentication: null,
        card: null,
        menu: null,
        config: null,
        settings: null,
        time: null,
        archive: null
    }
    const filters = {
        endBusnDate: new DateTimeNgb({day: 14, month: 8, year: 2019}, {hour: 1, minute: 1, second: 0}),
        endNotifDate: new DateTimeNgb({day: 15, month: 9, year: 2019}, {hour: 1, minute: 11, second: 0}),
        process: ['122', 'Amine'],
        publisher: ['122'],
        startBusnDate: new DateTimeNgb({day: 14, month: 8, year: 2019}, {hour: 1, minute: 1, second: 0}),
        startNotifDate: new DateTimeNgb({day: 24, month: 8, year: 2014}, {hour: 1, minute: 1, second: 0})
    };
    const existingFilterState: ArchiveState = {
        ...archiveInitialState,
        filters
    };

    it('manage empty filters', () => {
        const testAppState = {...emptyAppState, archive: archiveInitialState};
        expect(selectArchiveFilters(testAppState)).toEqual(archiveInitialState.filters);
        // expect(buildArchiveFilterSelector('someFilter')(testAppState)).toEqual(null);
        // expect(buildArchiveFilterSelector('someFilter', 'fallback')(testAppState)).toEqual('fallback');
    });


    it('return archive  and specific filter', () => {
        const testAppState = {...emptyAppState, archive: existingFilterState};
        expect(selectArchiveFilters(testAppState)).toEqual(existingFilterState.filters);
        //expect(buildArchiveFilterSelector('someFilter')(testAppState)).toEqual(['filterValue1', 'filterValue2']);
        //expect(buildArchiveFilterSelector('someFilter','fallback')(testAppState)).toEqual(['filterValue1', 'filterValue2']);
        //expect(buildArchiveFilterSelector('someOtherFilterThatDoesntExist', 'fallback')(testAppState)).toEqual('fallback');
    });




});
