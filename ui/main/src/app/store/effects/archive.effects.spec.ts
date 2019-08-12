/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {getSeveralRandomLightCards} from '@tests/helpers';
import {Actions} from '@ngrx/effects';
import {hot} from 'jasmine-marbles';
import {ArchiveEffects} from "@ofEffects/archive.effects";
import {ArchiveQuerySuccess, SendArchiveQuery} from "@ofActions/archive.actions";
import {LightCard} from "@ofModel/light-card.model";
import {Page} from "@ofModel/page.model";
import { UpdateArchiveFilter } from '../actions/archive.actions';
import { IArchiveFilter } from '@ofModel/archive-filter.model';
import { DateTimeNgb } from '@ofModel/datetime-ngb.model';

fdescribe('ArchiveEffects', () => {
    let effects: ArchiveEffects;

    it('should return an ArchiveQuerySuccess after SendArchiveQuery triggers query through cardService (no paging) ', () => {
        const expectedLightCards =  getSeveralRandomLightCards();
        const expectedPage = new Page<LightCard>(1,expectedLightCards.length,expectedLightCards);

        const localActions$ = new Actions(hot('-a--', {a: new SendArchiveQuery({params: new Map<string, string[]>()})}));
        let filters: IArchiveFilter;

        filters = {
            endBusnDate: new DateTimeNgb({day: 14, month: 8, year: 2019}, {hour: 1, minute: 1, second: 0}),
            endNotifDate: new DateTimeNgb({day: 15, month: 9, year: 2019}, {hour: 1, minute: 11, second: 0}),
            process: ['122', 'Amine'],
            publisher: ['122'],
            startBusnDate: new DateTimeNgb({day: 14, month: 8, year: 2019}, {hour: 1, minute: 1, second: 0}),
            startNotifDate: new DateTimeNgb({day: 24, month: 8, year: 2014}, {hour: 1, minute: 1, second: 0})
        };
        // const localActions$ = new Actions(hot('-a--', {a: new UpdateArchiveFilter({filters})}));
        
        const localMockCardService = jasmine.createSpyObj('CardService', ['fetchArchivedCards']);

        const mockStore = jasmine.createSpyObj('Store', ['dispatch', 'select']);

        localMockCardService.fetchArchivedCards.and.returnValue(hot('---b', {b: expectedPage}));
        const expectedAction = new ArchiveQuerySuccess({resultPage: expectedPage});
        const localExpected = hot('---c', {c: expectedAction});

        effects = new ArchiveEffects(mockStore, localActions$, localMockCardService);

        expect(1).toEqual(1);
        expect(effects).toBeTruthy();
        expect(effects.queryArchivedCards).toBeObservable(localExpected);
    });

});
