/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {inject, TestBed} from '@angular/core/testing';

import {AuthenticationService, AuthObject, isInTheFuture, LocalStorageAuthContent} from './authentication.service';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import createSpyObj = jasmine.createSpyObj;
import {PayloadForSuccessfulAuthentication} from "@ofStore/actions/authentication.actions";
import {Guid} from "guid-typescript";
import {getPositiveRandomNumberWithinRange, getRandomAlphanumericValue} from "@tests/helpers";

fdescribe('AuthenticationService', () => {

  let httpMock: HttpTestingController;

  beforeEach(() => {

    TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
      providers: [AuthenticationService]
    });
    httpMock = TestBed.get(HttpTestingController);
  });

  it('should be created', inject([AuthenticationService], (service: AuthenticationService) => {
    expect(service).toBeTruthy();
  }));

  it('should reject a stored date in the past', inject([AuthenticationService], (service: AuthenticationService) => {
    spyOn(localStorage, 'getItem').and.callFake( () => '10');
    expect(service.verifyExpirationDate()).toEqual(false);
    expect(service.isExpirationDateOver()).toEqual(true);
  }));

  it('should reject a stored date in the past', inject([AuthenticationService], (service: AuthenticationService) => {
    spyOn(localStorage, 'getItem').and.callFake( () => '10');
    expect(service.verifyExpirationDate()).toEqual(false);
    expect(service.isExpirationDateOver()).toEqual(true);
  }));

  it('should reject a stored date isNaN', inject([AuthenticationService], (service: AuthenticationService) => {
    spyOn(localStorage, 'getItem').and.callFake( () => 'abcd');
    expect(service.verifyExpirationDate()).toEqual(false);
    expect(service.isExpirationDateOver()).toEqual(true);
  }));

  it('should reject a stored date if it\'s now', inject([AuthenticationService], (service: AuthenticationService) => {
    spyOn(localStorage, 'getItem').and.callFake( () => Date.now().toString());
    expect(service.verifyExpirationDate()).toEqual(false);
    expect(service.isExpirationDateOver()).toEqual(true);
  }));

  it('should accept a stored date if it\'s in the future', inject([AuthenticationService], (service: AuthenticationService) => {
    spyOn(localStorage, 'getItem').and.callFake( () => (Date.now() + 10000).toString());
    expect(service.verifyExpirationDate()).toEqual(true);
    expect(service.isExpirationDateOver()).toEqual(false);
  }));


  it('should clear the local storage when clearAuthenticationInformation', inject([AuthenticationService], (service: AuthenticationService) => {
    spyOn(localStorage, 'clear').and.callThrough();
    service.clearAuthenticationInformation();
    expect(localStorage.clear).toHaveBeenCalled();
  }));

  it('should set items in localStorage when save Authentication Information', inject([AuthenticationService], (service: AuthenticationService) => {
    spyOn(localStorage, 'setItem').and.callThrough();
    const mockPayload = new PayloadForSuccessfulAuthentication('identifier',
        Guid.create(), 'token', new Date());
    service.saveAuthenticationInformation(mockPayload);
    expect(localStorage.setItem).toHaveBeenCalled();
  }));

  it( 'should extract the token from the localstorage', inject([AuthenticationService]
      , (service: AuthenticationService) => {
    spyOn(localStorage, 'getItem').and.callThrough();
    service.extractToken();
    expect(localStorage.getItem).toHaveBeenCalled();
      }));

  it( 'should create a congruent payload object from AuthObject', inject([AuthenticationService]
      , (service: AuthenticationService) => {
        const identifier = getRandomAlphanumericValue(12);
        const guid = Guid.create();
        const token = getRandomAlphanumericValue(125);
        const expirationTime = getPositiveRandomNumberWithinRange(12,2500);
        const authObj= {identifier:identifier, access_token:token, expires_in: expirationTime, clientId: guid}as AuthObject;
        const result = service.convert(authObj);
        expect(result.token).toEqual(token);
        expect(result.identifier).toEqual(identifier);
        expect(result.clientId).toEqual(guid);
        expect(result.expirationDate.getTime()).toBeGreaterThanOrEqual(Date.now()+expirationTime);

      }));

});

describe('isInTheFuture', () => {

  it('should find 0 UTC time to be wrong', () =>
  {
    expect(isInTheFuture(0)).not.toEqual(true);
  })

  it( 'should find current time to be wrong', () =>{
    expect(isInTheFuture(Date.now())).not.toEqual(true);
  })

  it('should find tomorrow time to be true', () =>{
    const tomorrow = new Date();
     tomorrow.setDate(tomorrow.getDate()+1);
    expect(isInTheFuture(tomorrow.getTime())).toEqual(true);
  });

});
