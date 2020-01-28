
import {LightCardActions, LightCardActionTypes} from '@ofActions/light-card.actions';
import {CardFeedState, feedInitialState, LightCardAdapter} from '@ofStates/feed.state';
import {FeedActions, FeedActionTypes} from "@ofActions/feed.actions";

export function reducer(
    state:CardFeedState = feedInitialState,
    action: LightCardActions|FeedActions
): CardFeedState {
    switch (action.type) {
        case LightCardActionTypes.LoadLightCardsSuccess: {
            return {
                ...LightCardAdapter.upsertMany(action.payload.lightCards, state),
                loading: false,
                lastCards: action.payload.lightCards
            };
        }
        case LightCardActionTypes.EmptyLightCards: {
            return {
                ...LightCardAdapter.removeAll(state),
                selectedCardId: null,
                loading: false,
                lastCards:[]
            };
        }

        case LightCardActionTypes.RemoveLightCard:{
            return {
                ...LightCardAdapter.removeMany(action.payload.cards,state),
                loading:false,
                lastCards:[]
            }
        }
        case LightCardActionTypes.LoadLightCardsFailure: {
            return {
                ...state,
                loading: false,
                error: `error while loading cards: '${action.payload.error}'`,
                lastCards: []
            };
        }

        case LightCardActionTypes.SelectLightCard: {
            return {
                ...state,
                selectedCardId: action.payload.selectedCardId,
                lastCards: []
            }
        }

        case LightCardActionTypes.ClearLightCardSelection: {
            return {
                ...state,
                selectedCardId: null
            }
        }

        case LightCardActionTypes.AddLightCardFailure: {
            return {
                ...state,
                loading: false,
                error: `error while adding a single lightCard: '${action.payload.error}'`,
                lastCards: []
            };
        }
        case FeedActionTypes.ApplyFilter: {
            if(state.filters.get(action.payload.name)) {
                const filters = new Map(state.filters);
                const filter = filters.get(action.payload.name).clone();
                filter.active = action.payload.active;
                filter.status = action.payload.status;
                filters.set(action.payload.name, filter);
                return {
                    ...state,
                    loading: false,
                    filters: filters
                };
            }
            return {...state}
        }

        case FeedActionTypes.InitFilter: {
            return {
                ...state,
                loading: false,
                filters: action.payload.filters
            };
        }
        case LightCardActionTypes.UpdateALightCard:{
            return LightCardAdapter.upsertOne(action.payload.card, state);
        }
        default: {
            return state;
        }
    }
}
