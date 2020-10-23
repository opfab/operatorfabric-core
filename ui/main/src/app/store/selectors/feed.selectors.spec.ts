/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



import {AppState} from '@ofStore/index';
import {emptyAppState4Test, getOneRandomCard, getSeveralRandomLightCards} from '@tests/helpers';
import {
    CardFeedState,
    compareByPublishDate,
    compareByReadPublishDate,
    compareByReadSeverityPublishDate,
    compareBySeverityPublishDate,
    feedInitialState,
    LightCardAdapter
} from "@ofStates/feed.state";
import {selectSortedFilteredLightCards} from "@ofSelectors/feed.selectors";
import {LightCard} from "@ofModel/light-card.model";

describe('FeedSelectors', () => {
    const emptyAppState: AppState = emptyAppState4Test;
    const selectedState: CardFeedState = {
        ...feedInitialState
    };

    it('should be sorted by publishDate if sortByRead=false and sortBySeverity=false', () => {

        const lightCards: LightCard[] = getSeveralRandomLightCards(6);

        const testAppState = { ...emptyAppState,
            feed: {
                ...LightCardAdapter.upsertMany(lightCards, selectedState),
                sortBySeverity: false,
                sortByRead: false
            }
        }

        //Expected sort
        const sortedLightCards: LightCard[] = lightCards.sort(compareByPublishDate)
        expect(selectSortedFilteredLightCards(testAppState)).toEqual(sortedLightCards);

    });

    it('should be sorted by severity,publishDate if sortByRead=false and sortBySeverity=true', () => {

        const lightCards: LightCard[] = getSeveralRandomLightCards(6);

        const testAppState = { ...emptyAppState,
            feed: {
                ...LightCardAdapter.upsertMany(lightCards, selectedState),
                sortBySeverity: true,
                sortByRead: false
            }
        }

        //Expected sort
        const sortedLightCards: LightCard[] = lightCards.sort(compareBySeverityPublishDate)
        expect(selectSortedFilteredLightCards(testAppState)).toEqual(sortedLightCards);

    });

    it('should be sorted by read,severity,publishDate if sortByRead=true and sortBySeverity=true', () => {

        const lightCards: LightCard[] = getSeveralRandomLightCards(6);

        const testAppState = { ...emptyAppState,
            feed: {
                ...LightCardAdapter.upsertMany(lightCards, selectedState),
                sortBySeverity: true,
                sortByRead: true
            }
        }

        //Expected sort
        const sortedLightCards: LightCard[] = lightCards.sort(compareByReadSeverityPublishDate)
        expect(selectSortedFilteredLightCards(testAppState)).toEqual(sortedLightCards);

    });

    it('should be sorted by read,publishDate if sortByRead=true and sortBySeverity=false', () => {

        const lightCards: LightCard[] = getSeveralRandomLightCards(6);

        const testAppState = { ...emptyAppState,
            feed: {
                ...LightCardAdapter.upsertMany(lightCards, selectedState),
                sortBySeverity: false,
                sortByRead: true
            }
        }

        //Expected sort
        const sortedLightCards: LightCard[] = lightCards.sort(compareByReadPublishDate)
        expect(selectSortedFilteredLightCards(testAppState)).toEqual(sortedLightCards);

    });
});
