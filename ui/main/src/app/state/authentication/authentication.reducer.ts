import {AuthenticationActions, AuthenticationActionTypes} from '@state/authentication/authentication.actions';


export interface State {
  identifier: string;
  token: string;
  expirationDate: Date;
  denialReason: string;
}

export const initialState: State = {
  identifier: null,
  token: null,
  expirationDate: null,
  denialReason: null
};

export function reducer(state = initialState, action: AuthenticationActions): State {
  switch (action.type) {

    case AuthenticationActionTypes.AcceptLogIn: {
      const payload = action.payload;
      return {
        ...state,
        identifier: payload.identifier,
        token: payload.token,
        expirationDate: payload.expirationDate
      };
    }
    case AuthenticationActionTypes.RejectLogIn: {
      return {
        ...state,
        identifier: null,
        token: null,
        expirationDate: null,
        denialReason: action.payload.denialReason
      };
    }
    case AuthenticationActionTypes.LogOut:{
      return {
        ...state,
        identifier: null,
        token: null,
        expirationDate: null,
        denialReason: null
      };
    }
    default:
      return state;
  }
}
