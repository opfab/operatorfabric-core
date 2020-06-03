
import {Injectable} from '@angular/core';
import {Store} from '@ngrx/store';
import {AppState} from "@ofStore/index";
import {Actions, Effect, ofType} from '@ngrx/effects';
import {UserService} from '@ofServices/user.service';
import {Observable} from 'rxjs';
import {
    CreateUserApplication,
    CreateUserApplicationOnFailure,
    CreateUserApplicationOnSuccess,
    UserActions,
    UserActionsTypes,
    UserApplicationNotRegistered,
    UserApplicationRegistered
} from '@ofStore/actions/user.actions';
import {AcceptLogIn, AuthenticationActionTypes} from '@ofStore/actions/authentication.actions';
import {catchError, map, switchMap} from 'rxjs/operators';
import {User} from '@ofModel/user.model';
import {AuthenticationService} from "@ofServices/authentication/authentication.service";


@Injectable()
export class UserEffects {

    constructor(private store: Store<AppState>,
                private actions$: Actions,
                private userService: UserService,
                private authService: AuthenticationService
    ) {
    }

    /**
     * after that the user is authentificated throught the token,
     * detect if the user is already registered in the application and raise the UserApplicationRegistered action
     * if not, set the creation user workflow
     */
    @Effect()
    checkUserApplication: Observable<UserActions> = this.actions$
        .pipe(
            ofType(AuthenticationActionTypes.AcceptLogIn),
            switchMap((action: AcceptLogIn) => {
                const userPayload = action.payload;
                return this.userService.askUserApplicationRegistered(userPayload.identifier)
                    .pipe(
                        map((user: User) => new UserApplicationRegistered({user})),
                        catchError((error, caught) => {
                            const userData: User = new User(userPayload.identifier, userPayload.firstName, userPayload.lastName);
                            this.store.dispatch(new UserApplicationNotRegistered({error: error, user: userData}));
                            return caught;
                        })
                    );
            })
        );

    /**
     * transition to the creation user application workflow
     */
    @Effect()
    transition2CreateUserApplication: Observable<UserActions> = this.actions$
        .pipe(
            ofType(UserActionsTypes.UserApplicationNotRegistered),
            map((action: UserApplicationNotRegistered) => {
                const userDataPayload = action.payload.user;
                return new CreateUserApplication({user: userDataPayload});
            })
        );

    /**
     * create the user application (first time in the application)
     * raise an CreateUserApplicationOnSuccess action or CreateUserApplicationOnFailure action.
     */
    @Effect()
    CreateUserApplication: Observable<UserActions> = this.actions$
        .pipe(
            ofType(UserActionsTypes.CreateUserApplication),
            switchMap((action: CreateUserApplication) => {
                const user = action.payload.user;
                return this.userService.askCreateUser(user)
                    .pipe(
                        map(currentUser => {
                            return new CreateUserApplicationOnSuccess({user: currentUser});
                        }),
                        catchError((error, caught) => {
                            this.authService.clearAuthenticationInformation();
                            this.store.dispatch(new CreateUserApplicationOnFailure({error: error}));
                            return caught;
                        })
                    );
            }),
        );

    /**
     * transition to the userApplicationRegistered action after an CreateUserApplicationOnSuccess action
     */
    @Effect()
    transition2UserApplicationRegistered: Observable<UserActions> = this.actions$
        .pipe(
            ofType(UserActionsTypes.CreateUserApplicationOnSuccess),
            map((action: CreateUserApplicationOnSuccess) => {
                const userDataPayload = action.payload.user;
                return new UserApplicationRegistered({user: userDataPayload});
            })
        );

}
