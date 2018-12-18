import {createFeatureSelector, createSelector} from '@ngrx/store';
import * as fromAuthentication from '@ofStore/reducers/authentication.reducer';
import {AuthState} from "@ofStates/authentication.state";

export const selectAuthenticationState = createFeatureSelector<AuthState>('authentication');

export const selectExpirationTime = createSelector(selectAuthenticationState, fromAuthentication.getExpirationTime);