import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from "@ofStore/index";
import { Actions, Effect, ofType } from '@ngrx/effects';
import { UserService } from '@ofServices/user.service';
import { Observable } from 'rxjs';
import { UserActions, UserActionsTypes, CreateUserApplicationOnSuccess, CreateUserApplicationOnFailure, UserApplicationRegistered, UserApplicationNotRegistered,  CreateUserApplication } from '@ofStore/actions/user.actions';
import { AuthenticationActionTypes, AcceptLogIn } from '@ofStore/actions/authentication.actions';
// import { UserActionsTypes } from '@ofStore/actions/user.actions';
import { tap, switchMap, map, catchError } from 'rxjs/operators';
import { User } from '@ofModel/user.model';
import { AuthenticationService } from '@ofServices/authentication.service';


@Injectable()
export class UserEffects {

    constructor(private store: Store<AppState>, private actions$:Actions, private userService: UserService) {}

    @Effect()
    checkUserApplication: Observable<UserActions> = this.actions$
        .pipe(
            ofType(AuthenticationActionTypes.AcceptLogIn), 
            switchMap((action: AcceptLogIn) => {
                const userPayload = action.payload;
                console.log(userPayload);
                return this.userService.askUserApplicationRegistered(userPayload.identifier)
                    .pipe(
                        map((user: User) => new UserApplicationRegistered({user})),
                        catchError((error, caught) => {
                            console.log("askUserApplicationRegistered ---------", error, "caught : " + caught, "payload.identifier : " + userPayload.identifier);
                            const userData : User = new User(userPayload.identifier, userPayload.firstName, userPayload.lastName);
                            this.store.dispatch(new UserApplicationNotRegistered({error :error, user : userData }));
                            return caught;
                        })    
            
                    );
            })            
        ); 

    @Effect()
    transitionCreateUserApplication: Observable<UserActions> = this.actions$
        .pipe(
            ofType(UserActionsTypes.UserApplicationNotRegistered), 
            map((action: UserApplicationNotRegistered) => {
                const userDataPayload = action.payload.user;
                console.log("transitionCreateUserApplication userPayload : " + userDataPayload);
                return new CreateUserApplication({user: userDataPayload});
            })
        ); 

    @Effect()
    CreateUserApplication: Observable<UserActions> = this.actions$
        .pipe(
            ofType(UserActionsTypes.CreateUserApplication), 
            switchMap((action: CreateUserApplication) => {
                const user = action.payload.user;
                return this.userService.askCreateUser(user)
                    .pipe(
                        map(user => {
                            console.log("ok creation user " + user.login);
                            return new CreateUserApplicationOnSuccess({user})
                        }),
                        catchError((error, caught) => {
                            console.log(error, caught, "error on creation user application for the user ")
                            this.store.dispatch(new CreateUserApplicationOnFailure({error:error}));
                            return caught;
                        })
                    );
            }),
            
        );
        
}