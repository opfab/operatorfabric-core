/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {getOneRandomCard} from '@tests/helpers';
import {Actions} from '@ngrx/effects';
import {hot} from 'jasmine-marbles';
import {FeedFiltersEffects} from "@ofEffects/feed-filters.effects";
import {Filter} from "@ofModel/feed-filter.model";
import {AcceptLogIn, PayloadForSuccessfulAuthentication} from "@ofActions/authentication.actions";
import {InitFilters} from "@ofActions/feed.actions";

describe('FeedFilterEffects', () => {
    let effects: FeedFiltersEffects;

    describe('loadFeedFilterOnAuthenticationSuccess', () => {
        it('should return a InitFilter Action', () => {
            const expectedCard = getOneRandomCard();

            const localActions$ = new Actions(hot('a', {a: new AcceptLogIn(new PayloadForSuccessfulAuthentication(null, null, null, null))}));

            const localMockFeedFilterService = jasmine.createSpyObj('FilterService', ['defaultFilters']);

            const defaultFilters= new Map();
            defaultFilters.set('testFilter',
                new Filter(
                    () => false,
                    false,
                    {}
                ));

            localMockFeedFilterService.defaultFilters.and.returnValue(defaultFilters);

            const mockStore = jasmine.createSpyObj('Store', ['dispatch']);

            const expectedAction = new InitFilters({filters: localMockFeedFilterService.defaultFilters});
            const localExpected = hot('c', {c: expectedAction});

            effects = new FeedFiltersEffects(mockStore, localActions$, localMockFeedFilterService);

            expect(effects).toBeTruthy();
            expect(effects.loadFeedFilterOnAuthenticationSuccess).toBeObservable(localExpected);
        });
    });
});
