
import {EntityState} from '@ngrx/entity';
import {LightCard} from '@ofModel/light-card.model';
import {LightCardAdapter} from "@ofStates/feed.state";


/**
 * The Timeline State consist of:
 *  * EntityState of LightCard
 *  * selectedCardId: the currently selected card id
 *  * lastCards the last cards added / updated to the feed
 *  * loading: weather there is an ongoing state modification
 *  * error: last message during state processing before error
 *  * data: an array of data Card (less information than lightCard)
 *   which are use for display on the chart the number of card on timescale
 */
export interface TimelineState extends EntityState<LightCard> {
    selectedCardId: string;
    lastCards: LightCard[];
    loading: boolean;
    error: string;
    data: any[];
}

export const timelineInitialState: TimelineState = LightCardAdapter.getInitialState(
    {
        selectedCardId: null,
        lastCards: [],
        loading: false,
        error: '',
        data: []
    });
