import {ActionReducerMap, createFeatureSelector, createSelector, MetaReducer} from '@ngrx/store';
import * as fromRouter from '@ngrx/router-store';
import {AppState} from './app.interface';
import {reducer as lightCardReducer} from './light-card/light-card.reducer';
import {reducer as authenticationReducer} from './authentication/authentication.reducer';
import {reducer as cardOperationReducer} from './card-operation/card-operation.reducer';
import {environment} from '@env/environment';
import {storeFreeze} from 'ngrx-store-freeze';

export const appReducer: ActionReducerMap<AppState> = {
  router: fromRouter.routerReducer,
  lightCard: lightCardReducer,
  cardOperation: cardOperationReducer,
  authentication: authenticationReducer
};

export const selectRouterState = createFeatureSelector<fromRouter.RouterReducerState>('router');
export const getCurrentUrl = createSelector(selectRouterState,
  (router) => router.state && router.state.url);

export const appMetaReducers: MetaReducer<AppState>[] = !environment.production
? [storeFreeze]
  : [];
