/* Copyright (c) 2020, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { inject, TestBed } from '@angular/core/testing';

import { CardService } from './card.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthenticationService } from '@ofServices/authentication/authentication.service';
import { GuidService } from "@ofServices/guid.service";
import { StoreModule } from "@ngrx/store";
import { appReducer } from "@ofStore/index";
import SpyObj = jasmine.SpyObj;
import createSpyObj = jasmine.createSpyObj;
import { UserService } from './user.service';
import { User } from '@ofModel/user.model';
import { defer } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';


describe('UserService', () => {

    let httpClientSpy: { get: jasmine.Spy, put : jasmine.Spy};
    let userService: UserService;

    beforeEach(() => {
        httpClientSpy = jasmine.createSpyObj('HttpClient', ['get', 'put']);
        userService = new UserService(<any>httpClientSpy);
    });

    describe('test askUserApplicationRegistered', () => {
        it('should return expected user registered (HttpClient called once)', () => {
            const expectedUser: User = new User("expectedUser", "aaa", "bbb");

            httpClientSpy.get.and.returnValue(asyncData(expectedUser));

            userService.askUserApplicationRegistered("userRegistered").subscribe(
                oneUserRegistered => expect(expectedUser).toEqual(oneUserRegistered, 'expected user registered'),
                fail
            );
            expect(httpClientSpy.get.calls.count()).toBe(1, 'one call');
        });

        it('should return an error when the server returns a 404', () => {
            const errorResponse = new HttpErrorResponse({
                error: 'User not found',
                status: 404, statusText: 'NOT_FOUND'
            });

            httpClientSpy.get.and.returnValue(asyncError(errorResponse));

            userService.askUserApplicationRegistered("userNotRegistered").subscribe(
                userNotRegistered => fail('expected an error, not heroes'),
                error => expect(error.statusText).toContain('NOT_FOUND')
            );
        });
    })

    describe('test askCreateUser', () => {
        it('should return expected user created (HttpClient called once)', () => {
            const userToBeCreated = new User("createdUser", "aaa", "bbb");
            const createdUserExpected: User = new User("createdUser", "aaa", "bbb");

            httpClientSpy.put.and.returnValue(asyncData(createdUserExpected));

            userService.askCreateUser(userToBeCreated).subscribe(
                user => expect(createdUserExpected).toEqual(user, 'expected user created'),
                fail
            );
            expect(httpClientSpy.put.calls.count()).toBe(1, 'one call');
        });
    })
});


/** Create async observable that emits-once and completes
 *  after a JS engine turn */
export function asyncData<T>(data: T) {
    return defer(() => Promise.resolve(data));
}

/** Create async observable error that errors
 *  after a JS engine turn */
export function asyncError<T>(errorObject: any) {
    return defer(() => Promise.reject(errorObject));
}






// describe('UserService', () => {



//     let userService: UserService;
//     let httpMock: HttpTestingController;

//     let userDataExpected : User = {
//         login : 'opfab-user',
//         firstName : 'aze',
//         lastName: 'aze'
//     };

//     beforeEach(() => {
//         const authenticationServiceSpy = createSpyObj('authenticationService'
//             , ['extractToken'
//                 , 'verifyExpirationDate'
//                 , 'clearAuthenticationInformation'
//                 , 'registerAuthenticationInformation'
//             ]);

//         TestBed.configureTestingModule({
//             imports: [HttpClientTestingModule,
//                 StoreModule.forRoot(appReducer)],
//             providers: [UserService
//                 // , AuthenticationService
//             ]
//         });
//         httpMock = TestBed.get(HttpTestingController);
//         // authenticationService = TestBed.get(AuthenticationService);
//         userService = TestBed.get(UserService);
//     });

//     afterEach(() => {
//         httpMock.verify();
//     });

//     it('should be created', () => {
//         expect(userService).toBeTruthy();
//     });

//     describe('#askUserApplicationRegistered', () => {
//         it('should return an user found', () => {
//             userService.askUserApplicationRegistered("opfab-user").subscribe(
//                 result => {
//                     expect(eval(result.login)).toBe(userDataExpected.login);
//                     expect(eval(result.firstName)).toBe(userDataExpected.firstName);
//                     expect(eval(result.lastName)).toBe(userDataExpected.lastName);
//                 }
//             )
//         });
//     });

//     describe('#askCreateUser', () => {
//         it('should return the user created', () => {
//             const userDataSent : User = new User("opfab-user", "aze", "aze");
//             userService.askCreateUser(userDataSent).subscribe(
//                 result => {
//                     expect(eval(result.login)).toBe(userDataExpected.login);
//                     expect(eval(result.firstName)).toBe(userDataExpected.firstName);
//                     expect(eval(result.lastName)).toBe(userDataExpected.lastName);
//                 }
//             )
//         });
//     });

// });
