/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


import {async, getTestBed, TestBed,} from "@angular/core/testing";
import {Store} from "@ngrx/store";
import {AppState} from "@ofStore/index";
import {HttpClientTestingModule, HttpTestingController} from "@angular/common/http/testing";
import {environment} from "@env/environment";
import {ThirdActionService} from "@ofServices/third-action.service";
import {
    Action,
    ActionStatus,
    ActionType,
    emptyAction,
    extractActionStatusFromPseudoActionStatus
} from "@ofModel/thirds.model";
import {hot} from "jasmine-marbles";
import {getRandomAlphanumericValue, getRandomI18nData} from "@tests/helpers";
import {ThirdActionComporentModalReturn} from "../modules/cards/components/action/confirm-modal/confirm-modal.component";
import {UpdateAnAction} from "@ofActions/light-card.actions";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {Observable} from "rxjs";
import createSpyObj = jasmine.createSpyObj;

describe('ThirdActionService', () => {

    let injector: TestBed;
    let store: Store<AppState>;
    let httpClientMock: HttpTestingController;
    let thirdActionService: ThirdActionService;
    let actioStore: Store<AppState>;
    beforeEach(async(() => {
        actioStore = createSpyObj<Store<AppState>>('store', ['dispatch']);
        TestBed.configureTestingModule({
            imports: [
                HttpClientTestingModule
            ],
            providers: [
                ThirdActionService,
                {
                    provide: Store
                    , useValue: actioStore
                }]
        });
        injector = getTestBed();
        store = injector.get(Store);
        httpClientMock = injector.get(HttpTestingController);
        thirdActionService = injector.get(ThirdActionService);

    }));
    afterEach(() => {
        httpClientMock.verify();
    });

    it(`shouldn't call modal when Action Status stays unchanged` +
        ` and posts action`, () => {
        const lightCardId = getRandomAlphanumericValue(12);
        const actionKey = getRandomAlphanumericValue(12);
        const currentAction = emptyAction;
        const modalServiceMock = createSpyObj('NgbModal', ['open']);
        const postActionMock = hot('-a', {a: 'ok'});
        const modalCallOperator = thirdActionService.callModalIfNecessary(lightCardId
            , actionKey
            , modalServiceMock
            , postActionMock);
        const actionStatusVerification$ = hot('-b', {b: [false, currentAction]});
        const observable = actionStatusVerification$.pipe(modalCallOperator);
        const expected = hot('-c', {});

        expect(observable).toBeObservable(expected);
        // one action posted ?
        expect(postActionMock.getSubscriptions().length).toEqual(1);
    })

    it(`should call a modal when action status changed and post action if user chooses ok`, () => {
        const lightCardId = getRandomAlphanumericValue(12);
        const actionKey = getRandomAlphanumericValue(12);
        const currentAction = emptyAction;
        // the user click on OK
        const promiseOKMock = new Promise(() => true);
        const modalServiceMock = createSpyObj('NgbModal', ['open']);
        (<jasmine.Spy>modalServiceMock.open).and.returnValue(promiseOKMock);
        const postActionMock = hot('-a', {a: 'nothing'});
        const modalCallOperator = thirdActionService.callModalIfNecessary(lightCardId
            , actionKey
            , modalServiceMock
            , postActionMock);
        const actionStatusVerification$ = hot('-b', {
            b: [false
                , new Action(ActionType.EXTERNAL, getRandomI18nData())
            ]
        });
        const observable = actionStatusVerification$.pipe(modalCallOperator);
        const expected = hot('-c', {});
        expect(observable).toBeObservable(expected);
        // one action posted ?
        expect(postActionMock.getSubscriptions().length).toEqual(1);
    });

    it(`should call a modal when action status changed and do nothing if ` +
        `user dismisses the modal`, () => {
        const lightCardId = getRandomAlphanumericValue(12);
        const actionKey = getRandomAlphanumericValue(12);
        const modalServiceMock = createSpyObj('NgbModal', ['open']);
        (<jasmine.Spy>modalServiceMock.open).and.returnValue({result: Promise.reject(ThirdActionComporentModalReturn.DISMISS)});
        const postActionMock = hot('-a', {a: 'nothing'});
        const modalCallOperator = thirdActionService.callModalIfNecessary(lightCardId
            , actionKey
            , modalServiceMock
            , postActionMock);
        const actionStatusVerification$ = hot('-b', {
            b: [true
                , new Action(ActionType.EXTERNAL, getRandomI18nData())
            ]
        });
        actionStatusVerification$.pipe(modalCallOperator).subscribe();
        expect(postActionMock.getSubscriptions().length).toEqual(0);
    });

    it('should call modal service when actionStatus has changed', () => {

        // instantiate observable that should not be called
        const postAction$ = hot('x', {x: 'nothing'});

        // get an operator to test behavior
        const operatorCallingModal = thirdActionService.callModalIfNecessary(
            getRandomAlphanumericValue(12)
            , getRandomAlphanumericValue(12)
            , createSpyObj('NgbModal', ['open'])
            , postAction$
        );
        // here create a spy 4 ThirdActionService to
        const modalCalls = spyOn(thirdActionService, 'callModalAndHandleResponse');

        // here create the input observable
        const changedActionStatus = new ActionStatus(getRandomI18nData());
        const actionStatusHasChanged = true;
        const changedActionStatus$ = hot('a', {a: [actionStatusHasChanged, changedActionStatus]})

        // here specify the expected (or like so) observable
        const expected$ = hot('b', {b: undefined})

        // Check if all behave as expected
        const underScrutiny = operatorCallingModal(changedActionStatus$);

        expect(underScrutiny).toBeObservable(expected$);
        expect(modalCalls).toHaveBeenCalled();
        // has the real modal service call didn't occurs there mustn't be any post performed
        expect(postAction$.getSubscriptions().length).toEqual(0);
    });

    describe('when an action is perform by the user', () => {
        let modalServiceMock: NgbModal;
        let updateAThirdActionAction: UpdateAnAction;
        let postAction$: Observable<any>;
        let promise: Promise<any>;
        let dispatch: jasmine.Spy;

        beforeAll(() => {
            updateAThirdActionAction = new UpdateAnAction({
                cardId: getRandomAlphanumericValue(12)
                , actionKey: getRandomAlphanumericValue(3)
                , status: new ActionStatus(getRandomI18nData())
            });
        });
        beforeEach(() => {
            modalServiceMock = createSpyObj('NgbModal', ['open']);
            (<jasmine.Spy>modalServiceMock.open).and.callFake(() => {
                return {result: promise};
            });
            postAction$ = createSpyObj('Obsertable', ['subscribe']);

            dispatch = spyOn(thirdActionService, "dispatchUpdateThirdAction");

        });

        it('should perform a post on a confirmation of continuing the action of the modal', (done) => {
            const keepPerformThePost = true;
            promise = Promise.resolve(keepPerformThePost);
            const verifyExpectations = () => {
                expect(modalServiceMock.open).toHaveBeenCalled();
                expect(postAction$.subscribe).toHaveBeenCalled();
                expect(dispatch).not.toHaveBeenCalled();
                done();
            };
            thirdActionService.callModalAndHandleResponse(modalServiceMock, postAction$, updateAThirdActionAction);
            promise.then(verifyExpectations);
        });
        it('should not perform a post on a confirmation with false value of continuing the action of the modal', (done) => {
            const keepPerformThePost = false;
            promise = Promise.resolve(keepPerformThePost);
            const verifyExpectations = () => {
                expect(modalServiceMock.open).toHaveBeenCalled();
                expect(postAction$.subscribe).not.toHaveBeenCalled();
                expect(dispatch).not.toHaveBeenCalled();
                done();
            };
            thirdActionService.callModalAndHandleResponse(modalServiceMock, postAction$, updateAThirdActionAction);
            promise.then(verifyExpectations);
        });

        it('should dispatch an action to update third action on Cancel of the modal', (done) => {
            promise = Promise.reject(ThirdActionComporentModalReturn.CANCEL);
            const verifyExpectations = () => {
                expect(modalServiceMock.open).toHaveBeenCalled();
                expect(postAction$.subscribe).not.toHaveBeenCalled();
                expect(dispatch).toHaveBeenCalled();
                done();
            };
            thirdActionService.callModalAndHandleResponse(modalServiceMock, postAction$, updateAThirdActionAction);
            promise.then().catch(verifyExpectations);
        });

        it('should do nothing on dismiss of the modal', (done) => {
            promise = Promise.reject(ThirdActionComporentModalReturn.DISMISS);
            const verifyExpectations = () => {
                expect(modalServiceMock.open).toHaveBeenCalled();
                expect(postAction$.subscribe).not.toHaveBeenCalled();
                expect(dispatch).not.toHaveBeenCalled();
                done();
            };
            thirdActionService.callModalAndHandleResponse(modalServiceMock, postAction$, updateAThirdActionAction);
            promise.then().catch(verifyExpectations);
        });

        it('should do nothing when modal fail for an unknown reason', (done) => {
            promise = Promise.reject(new Error());
            const verifyExpectations = () => {
                expect(modalServiceMock.open).toHaveBeenCalled();
                expect(dispatch).not.toHaveBeenCalled();
                expect(postAction$.subscribe).not.toHaveBeenCalled();
                done();
            };
            thirdActionService.callModalAndHandleResponse(modalServiceMock, postAction$, updateAThirdActionAction);
            promise.then().catch(verifyExpectations);
        });


    });

    describe('when the post of an third action is performed', () => {
        let postResponse: Observable<any>;
        let dispatch: jasmine.Spy;
        let actionPath:string;
        let expectedUrl: string;
        let currentAction: Action;
        beforeEach(() => {
            actionPath = getRandomAlphanumericValue(10);
            expectedUrl = `${environment.urls.actions}` + actionPath;
            currentAction = new Action(ActionType.EXTERNAL
                , getRandomI18nData()
                ,true
                ,getRandomAlphanumericValue(3)
            );
            dispatch = spyOn(thirdActionService, 'dispatchUpdateThirdAction');
        });

        it('should not update the third action if no changed occurs', () => {
                thirdActionService.postActionAndUpdateIfNecessary(
                    getRandomAlphanumericValue(12)
                    , actionPath
                    , currentAction
                ).subscribe(() => {
                    expect(dispatch).not.toHaveBeenCalled();
                });

                const calls = httpClientMock.match(req => req.url == expectedUrl);
                expect(calls.length).toEqual(1);
            const currentActionStatus = extractActionStatusFromPseudoActionStatus(currentAction);
            calls[0].flush(currentActionStatus);
            }
        );

        it('should update the third action if a changed occurs', () =>{
            thirdActionService.postActionAndUpdateIfNecessary(
                getRandomAlphanumericValue(12)
                , actionPath
                , currentAction
            ).subscribe(() => {
                expect(dispatch).toHaveBeenCalled();
            });

            const calls = httpClientMock.match(req => req.url == expectedUrl);
            expect(calls.length).toEqual(1);
            const newActionStatus = new ActionStatus(getRandomI18nData());
            calls[0].flush(JSON.stringify(newActionStatus));

        })
    });
})
;
