
import {AppState} from "@ofStore/index";
import {createSelector} from "@ngrx/store";
import {MenuState} from "@ofStates/menu.state";

export const selectMenuState = (state:AppState) => state.menu;
export const selectMenuStateMenu =  createSelector(selectMenuState, (menuState:MenuState)=> menuState.menu);
export const selectMenuStateSelectedIframeURL =  createSelector(selectMenuState, (menuState:MenuState)=> menuState.selected_iframe_url);
