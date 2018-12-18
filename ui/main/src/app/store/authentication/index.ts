import {createFeatureSelector, createSelector} from "@ngrx/store";
import {State as AuthenticationState} from './authentication.reducer';
import * as fromAuthentication from './authentication.reducer';

export const getAuthenticationState = createFeatureSelector<AuthenticationState>('authentication');

export const getExpirationTime = createSelector(getAuthenticationState, fromAuthentication.getExpirationTime)