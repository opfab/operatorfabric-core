

import {createEntityAdapter, EntityAdapter, EntityState} from '@ngrx/entity';
import {LightCard, severityOrdinal} from '@ofModel/light-card.model';
import {Filter} from "@ofModel/feed-filter.model";
import {FilterType,FilterService} from "@ofServices/filter.service";

/**
 * The Feed State consist of:
 *  * EntityState of LightCard
 *  * selectedCardId: the currently selected card id
 *  * lastCards the last cards added / updated to the feed
 *  * loading: whether there is an ongoing state modification
 *  * message: last message during state processing
 *  * filters: a collection of filter to apply to the rendered feed
 *  * sortBySeverity: Indicates whether the cards in the feed should be sorted by severity before being sorted by
 *    publishDate (desc = latest first)
 */
export interface CardFeedState extends EntityState<LightCard> {
    selectedCardId: string;
    lastCards: LightCard[];
    loading: boolean;
    error: string;
    filters: Map<FilterType,Filter>;
    sortBySeverity: boolean;
}

export function compareByStartDate(card1: LightCard, card2: LightCard){
    return card1.startDate - card2.startDate
}

export function compareBySeverity(card1: LightCard, card2: LightCard){
    return severityOrdinal(card1.severity) - severityOrdinal(card2.severity);
}

export function compareByPublishDate(card1: LightCard, card2: LightCard){
    return card2.publishDate - card1.publishDate;
}

export function compareBySeverityPublishDate(card1: LightCard, card2: LightCard){
    let result = compareBySeverity(card1,card2);
    if(result == 0)
        result = compareByPublishDate(card1,card2);
    return result;
}

export const LightCardAdapter: EntityAdapter<LightCard> = createEntityAdapter<LightCard>({
    /* The sortComparer property can only be defined statically for performance optimization reasons.
    * See https://github.com/ngrx/platform/issues/898
    * So to implement a sort criteria chosen by the user, I switched to an unsorted EntityAdapter and did the sorting
    * in the selectors (see selectSortedFilterLightCardIds) */
});

/**
 * Hack to solve OC-604 
 * Init is done using a service , to be refactor 
 */
function getDefaultFilter()
{
    let filterservice = new FilterService();
    return filterservice.defaultFilters() ;
}

export const feedInitialState: CardFeedState = LightCardAdapter.getInitialState(
    {
        selectedCardId: null,
        lastCards: [],
        loading: false,
        error: '',
        filters: getDefaultFilter(),
        sortBySeverity: false
    });
