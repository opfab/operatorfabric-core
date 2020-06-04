

import {createFeatureSelector, createSelector} from '@ngrx/store';
import * as fromAuthentication from '@ofStore/reducers/authentication.reducer';
import {AuthState} from '@ofStates/authentication.state';
import * as _ from 'lodash';

export const selectAuthenticationState = createFeatureSelector<AuthState>('authentication');

export const selectExpirationTime = createSelector(selectAuthenticationState, fromAuthentication.getExpirationTime);
export const selectCode = createSelector(selectAuthenticationState, (authState) => authState.code);
export const selectMessage = createSelector(selectAuthenticationState, (authState) => authState.message);
export const selectIdentifier = createSelector(selectAuthenticationState, (authState) => authState.identifier);
export const selectUserNameOrIdentifier = createSelector(selectAuthenticationState, (authState) => {
    if (authState.lastName && authState.firstName) {
        return `${_.upperFirst(authState.firstName)} ${_.upperFirst(authState.lastName)}`;
    }
    return authState.identifier;
});
export const selectIsImplicitlyAuthenticated = createSelector(selectAuthenticationState
    , (authState) => authState.isImplicitlyAuthenticated);
