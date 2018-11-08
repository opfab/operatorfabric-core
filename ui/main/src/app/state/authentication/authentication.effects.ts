import {Injectable} from '@angular/core';
import {Actions, Effect} from '@ngrx/effects';
import {Observable, of} from 'rxjs';
import {
  AcceptLogIn,
  AuthenticationActions,
  AuthenticationActionTypes,
  RejectLogin
} from '@state/authentication/authentication.actions';
import {AuthenticationService, AuthObjet, CheckTokenResponse, ONE_SECOND} from '@core/services/authentication.service';
import {catchError, map, switchMap} from 'rxjs/operators';

@Injectable()
export class AuthenticationEffects {

  constructor(private actions$: Actions, private authService: AuthenticationService) {
  }

  @Effect()
  CheckAuthentication: Observable<AuthenticationActions> =
    this.actions$
    .ofType(AuthenticationActionTypes.CheckAuthenticationStatus)
    .pipe(
      switchMap(() => {
        const token = this.authService.extractToken();
        return this.authService.checkAuthentication(token);
      }),
      map((payload: CheckTokenResponse )=> {
        if (this.authService.verifyExpirationDate()) {
          return this.handleExpirationDateOver();
        }
        const token = this.authService.extractToken();
        return this.handleLogInAttempt(payload, token);
      }),
      catchError(err => {
        console.error(err);
        return of(new RejectLogin({denialReason: err}));
      })
    );
  private handleExpirationDateOver(): AuthenticationActions {
    this.authService.clearAuthenticationInformation();
    return new RejectLogin({denialReason: 'expiration date exceeded'});

  }
  private handleLogInAttempt(payload:CheckTokenResponse,token): AuthenticationActions {
    if (payload) {
      const authInfo=this.authService.registerAuthenticationInformation(payload,token);
      return new AcceptLogIn({identifier: authInfo.identifier,
        token: token, expirationDate: authInfo.expirationDate});

    }
    this.authService.clearAuthenticationInformation();
    return new RejectLogin({denialReason: 'invalid token'}) as AuthenticationActions;
  }

  @Effect()
  TempAutomaticLogin: Observable<AuthenticationActions>=
      this.actions$
          .ofType(AuthenticationActionTypes.TempAutomaticLogIn).pipe(
              switchMap(()=> this.authService.tempLogin()),
          map((authObj:AuthObjet)=> {
            const expirationDate = new Date().getTime() + ONE_SECOND*authObj.expires_in;
              return new AcceptLogIn({identifier: authObj.identifier
                  , token:authObj.access_token
                  , expirationDate :new Date(expirationDate)})
          })
      );

// gérer le rejet du token et la demande de reconnexion
//   @Effect()
//   RejectLogin: Observable<AuthenticationActions>=
//     this.actions$
//       .ofType(AuthenticationActionTypes.RejectLogIn)
//       .pipe();
}
