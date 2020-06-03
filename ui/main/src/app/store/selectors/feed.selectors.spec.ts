

import {AppState} from '@ofStore/index';
import {emptyAppState4Test, getOneRandomCard, getSeveralRandomLightCards} from '@tests/helpers';
import {
    CardFeedState,
    compareByPublishDate,
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

    it('should be sorted by publishDate if sortBySeverity=false', () => {

        const lightCards: LightCard[] = getSeveralRandomLightCards(6);

        const testAppState = { ...emptyAppState,
            feed: {
                ...LightCardAdapter.upsertMany(lightCards, selectedState),
                sortBySeverity: false
            }
        }

        //Expected sort
        const sortedLightCards: LightCard[] = lightCards.sort(compareByPublishDate)
        expect(selectSortedFilteredLightCards(testAppState)).toEqual(sortedLightCards);

    });

    it('should be sorted by severity,publishDate if sortBySeverity=true', () => {

        const lightCards: LightCard[] = getSeveralRandomLightCards(6);

        const testAppState = { ...emptyAppState,
            feed: {
                ...LightCardAdapter.upsertMany(lightCards, selectedState),
                sortBySeverity: true
            }
        }

        //Expected sort
        const sortedLightCards: LightCard[] = lightCards.sort(compareBySeverityPublishDate)
        expect(selectSortedFilteredLightCards(testAppState)).toEqual(sortedLightCards);

    });

});
