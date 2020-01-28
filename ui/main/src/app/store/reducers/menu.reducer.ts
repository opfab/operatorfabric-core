
import {CardFeedState} from '@ofStates/feed.state';
import {menuInitialState, MenuState} from "@ofStates/menu.state";
import {MenuActions, MenuActionTypes} from "@ofActions/menu.actions";

export function reducer(
    state = menuInitialState,
    action: MenuActions
): MenuState {
    switch (action.type) {
        case MenuActionTypes.LoadMenu: {
            return {
                ...state,
                loading: true
            };
        }
        case MenuActionTypes.LoadMenuSuccess: {
            return {
                ...state,
                menu: action.payload.menu,
                loading: false
            };
        }

        case MenuActionTypes.LoadMenuFailure: {
            return {
                ...state,
                loading: false,
                error: `error while loading menu: '${action.payload.error}'`
            };
        }

        case MenuActionTypes.SelectMenuLinkSuccess: {
            return {
                ...state,
                selected_iframe_url: action.payload.iframe_url
            }
        }

        case MenuActionTypes.SelectMenuLinkFailure: {
            return {
                ...state,
                error: `error while retrieving third-party menu url: '${action.payload.error}'`
            };
        }

        default: {
            return state;
        }
    }
}

export const getSelectedId = (state: CardFeedState) => state.selectedCardId;
