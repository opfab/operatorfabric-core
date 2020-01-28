
import {CardFeedState} from '@ofStates/feed.state';
import {cardInitialState, CardState} from '@ofStates/card.state';
import {CardActions, CardActionTypes} from '@ofActions/card.actions';

export function reducer(
    state = cardInitialState,
    action: CardActions
): CardState {
    switch (action.type) {
        case CardActionTypes.ClearCard: {
            return cardInitialState;
        }
        case CardActionTypes.LoadCard: {
            return {
                ...state,
                loading: true
            };
        }
        case CardActionTypes.LoadCardSuccess: {
            return {
                ...state,
                selected: action.payload.card,
                loading: false
            };
        }
        case CardActionTypes.LoadCardFailure: {
            return {
                ...state,
                selected: null,
                loading: false,
                error: `error while loading a Card: '${action.payload.error}'`
            };
        }
        case CardActionTypes.LoadArchivedCard: {
            return {
                ...state,
                loading: true
            };
        }
        case CardActionTypes.LoadArchivedCardSuccess: {
            return {
                ...state,
                selected: action.payload.card,
                loading: false
            };
        }
        case CardActionTypes.LoadArchivedCardFailure: {
            return {
                ...state,
                selected: null,
                loading: false,
                error: `error while loading a Card: '${action.payload.error}'`
            };
        }
        case CardActionTypes.AddActionsAppear: {
            let actionsAppear = [];
            if (state.actionsAppear.includes(action.payload)) {
                actionsAppear = [...state.actionsAppear];
            } else {
                actionsAppear = [...state.actionsAppear, action.payload];
            }
            return {
                ...state,
                actionsAppear
            };
        }

        default: {
            return state;
        }
    }
}


export const getSelectedId = (state: CardFeedState) => state.selectedCardId;
