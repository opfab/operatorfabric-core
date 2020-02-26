/* Copyright (c) 2020, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */


import {AppState} from '@ofStore/index';
import {emptyAppState4Test, getOneRandomCard, getSeveralRandomLightCards} from '@tests/helpers';
import {
    CardFeedState,
    compareByLttdPublishDate,
    compareBySeverityLttdPublishDate,
    feedInitialState,
    LightCardAdapter
} from "@ofStates/feed.state";
import {selectSortedFilteredLightCards} from "@ofSelectors/feed.selectors";
import {LightCard} from "@ofModel/light-card.model";

describe('FeedSelectors', () => {
    const emptyAppState: AppState = emptyAppState4Test; //TODO Do we need it?
    const selectedState: CardFeedState = {
        ...feedInitialState
    };

    it('should be sorted by lttd,publishDate if sortBySeverity=false', () => {

        const lightCards: LightCard[] = getSeveralRandomLightCards(6);

        const testAppState = { ...emptyAppState,
            feed: {
                ...LightCardAdapter.upsertMany(lightCards, selectedState),
                sortBySeverity: false
            }
        }

        //Expected sort
        const sortedLightCards: LightCard[] = lightCards.sort(compareByLttdPublishDate)
        expect(selectSortedFilteredLightCards(testAppState)).toEqual(sortedLightCards);

    });

    it('should be sorted by severity,lttd,publishDate if sortBySeverity=true', () => {

        const lightCards: LightCard[] = getSeveralRandomLightCards(6);

        const testAppState = { ...emptyAppState,
            feed: {
                ...LightCardAdapter.upsertMany(lightCards, selectedState),
                sortBySeverity: true
            }
        }

        //Expected sort
        const sortedLightCards: LightCard[] = lightCards.sort(compareBySeverityLttdPublishDate)
        expect(selectSortedFilteredLightCards(testAppState)).toEqual(sortedLightCards);

    });

});
