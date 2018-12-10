import {createFeatureSelector, createSelector} from "@ngrx/store";
import {State as IdentificationState} from './identification.reducer';
import * as fromIdentification from './identification.reducer';

export const getIdentificationState = createFeatureSelector<IdentificationState>('identification');

export const isAuthenticated = createSelector(getIdentificationState, fromIdentification.isAuthenticatedUntilTime)