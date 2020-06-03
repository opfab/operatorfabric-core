
import { userInitialState, UserState } from '@ofStore/states/user.state';
import * as userActions from '@ofStore/actions/user.actions';


export function reducer (state : UserState = userInitialState, action : userActions.UserActions) : UserState {
    switch(action.type) {
        case userActions.UserActionsTypes.UserApplicationNotRegistered :
        case userActions.UserActionsTypes.CreateUserApplicationOnFailure :
            return {
                ...state, 
                registered : false
            };
        case userActions.UserActionsTypes.CreateUserApplicationOnSuccess :
            return {
                ...state, 
                registered : true
            };
        default :
            return state;
    }
}
