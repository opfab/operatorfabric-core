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
                            // return new UserApplicationNotRegistered({error :error, user : userPayload.identifier });
                        })    
                        // catchError((error) => {
                        //     console.log("askUserApplicationRegistered ---------", error, "payload.identifier : " + userPayload.identifier);
                        //     // this.store.dispatch(new UserApplicationNotRegistered({error :error, user : userPayload.identifier }));
                        //     // return caught;
                        //     return new UserApplicationNotRegistered({error :error, user : userPayload.identifier });
                        // })                    
                    );
            })            
        ); 


    // code à refactorer
    // map((user: User) => new UserApplicationRegistered({user})),
    //         catchError((httpResponse, caught) => {
    //             let message, key;
    //             let params = new Map<string>()
    //             let isFirstTime = false;
    //             switch (httpResponse.status) {
    //                 case 401:
    //                     isFirstTime = true;
    //                     message = 'error 401 : in this case, the user is not registered';
    //                     break;
    //                 case 0:
    //                 case 500:
    //                     message = 'User service currently unavailable';
    //                     key = 'user.service.error.unavailable';
    //                     break;
    //                 default:
    //                     message = 'Unexpected error';
    //                     key = 'user.service.error.unexpected';
    //                     params['error'] = httpResponse.message;
    //             }
    //             console.error(message, httpResponse);
    //             if (isFirstTime) {
    //                 const user = new User(payload.identifier, payload.firstName, payload.lastName);
    //                 return of(new CreateUserApplication({user}));
    //             }
    //             return of(new RejectLogIn({ error: new Message(message, MessageLevel.ERROR, new I18n(key, params)) }));            
    //         })


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
                return this.userService.askCreateUser(AuthenticationService.extractToken(), user)
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