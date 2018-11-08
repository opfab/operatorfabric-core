import {RouterReducerState} from '@ngrx/router-store';
import {RouterStateUrl} from './shared/utils';
import {State as CardState} from './light-card/light-card.reducer';
import {State as AuthenticationState} from './authentication/authentication.reducer';
import {State as CardOperationState} from './card-operation/card-operation.reducer';

export interface AppState {
  router: RouterReducerState<RouterStateUrl>;
  lightCard: CardState;
  authentication: AuthenticationState;
  cardOperation: CardOperationState;
}

export type State = AppState;
