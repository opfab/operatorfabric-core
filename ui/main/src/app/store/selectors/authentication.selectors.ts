import {createFeatureSelector, createSelector} from '@ngrx/store';
import {State as AuthenticationState} from '@ofStore/reducers/authentication.reducer';
import * as fromAuthentication from '@ofStore/reducers/authentication.reducer';

export const selectAuthenticationState = createFeatureSelector<AuthenticationState>('authentication');

export const selectExpirationTime = createSelector(selectAuthenticationState, fromAuthentication.getExpirationTime);