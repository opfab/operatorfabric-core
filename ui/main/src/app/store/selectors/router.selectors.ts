
import {createFeatureSelector, createSelector} from '@ngrx/store';
import * as fromRouter from '@ngrx/router-store';

export const selectRouterState = createFeatureSelector<fromRouter.RouterReducerState>('router');
export const selectCurrentUrl = createSelector(selectRouterState,
    (router) => {
        if (router)
            return router.state && router.state.url
        return null;
    });