/* Copyright (c) 2018, RTE (http://www.rte-france.com)
*
* This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this
* file, You can obtain one at http://mozilla.org/MPL/2.0/.
    */

import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {environment} from "@env/environment";
import {Action, ActionStatus, extractActionStatusFromPseudoActionStatus} from "@ofModel/thirds.model";
import {map} from "rxjs/operators";
import * as _ from "lodash";
import {
    ConfirmModalComponent,
    ThirdActionComporentModalReturn
} from "../modules/cards/components/action/confirm-modal/confirm-modal.component";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {AppState} from "@ofStore/index";
import {Store} from "@ngrx/store";
import {UpdateAnAction} from "@ofActions/light-card.actions";
import {Observable} from "rxjs";

@Injectable()
export class ThirdActionService {
    readonly actionUrl: string;

    constructor(private httpClient: HttpClient
        , private store: Store<AppState>) {
        this.actionUrl = `${environment.urls.actions}`;
    }

    checkIfReceivedStatusIsDifferentFromCurrentOne(formerStatus: ActionStatus) {
        return map((currentStatus: ActionStatus) => {
            const status = extractActionStatusFromPseudoActionStatus(formerStatus);
            const normalizedCurrentStatus = extractActionStatusFromPseudoActionStatus(currentStatus);
            const hasChanged = !_.isEqual(status, normalizedCurrentStatus);
            return [hasChanged, currentStatus];
        });
    }

    postActionAndUpdateIfNecessary(lightCardId: string, currentActionPath: string, action: Action) {
        return this.httpClient.post(`${this.actionUrl}${currentActionPath}`, action).pipe(
            this.checkIfReceivedStatusIsDifferentFromCurrentOne(action as ActionStatus),
            map(([hasChanged, currentStatus]: [boolean, ActionStatus]) => {
                if (hasChanged) {
                    const updateThirdActionAction = new UpdateAnAction({
                        cardId: lightCardId,
                        actionKey: action.key
                        , status: currentStatus
                    });
                    this.dispatchUpdateThirdAction(updateThirdActionAction);
                }
            })
        );
    }

    callModalIfNecessary(lightCardId: string, actionKey: string, modalService: NgbModal, postAction$: Observable<void>) {
        return map(([hasChanged, currentStatus]: [boolean, ActionStatus]) => {
            if (hasChanged) {
                const updateThirdAction = new UpdateAnAction({
                    cardId: lightCardId
                    , actionKey: actionKey
                    , status: currentStatus
                });
                this.callModalAndHandleResponse(modalService, postAction$, updateThirdAction);
            } else {
                postAction$.subscribe();
            }
        });
    }

    callModalAndHandleResponse(modalService: NgbModal, postAction$: Observable<void>, updateThirdAction: UpdateAnAction) {
        modalService
            .open(ConfirmModalComponent)
            .result
            .then(performPost => {
                if (performPost) postAction$.subscribe()
            })
            .catch(error => {
                switch (error) {
                    case ThirdActionComporentModalReturn.CANCEL: {
                        // save new status of action and do nothing
                        this.dispatchUpdateThirdAction(updateThirdAction);
                        break;
                    }
                    case ThirdActionComporentModalReturn.DISMISS: {
                        // do nothing leaves the former action status untouched
                        break;
                    }
                    default:
                        console.log('unknown error from update action status modal', error);
                }
            });
    }

    submit(lightCardId: string
        , currentActionPath: string
        , action: Action
        , modalService: NgbModal) {

        const postAction$ = this.postActionAndUpdateIfNecessary(lightCardId, currentActionPath, action);

        if (action.updateStateBeforeAction) {
            this.httpClient.get(`${this.actionUrl}${currentActionPath}`).pipe(
                this.checkIfReceivedStatusIsDifferentFromCurrentOne(action as ActionStatus),
                this.callModalIfNecessary(lightCardId, action.key, modalService, postAction$)
            ).subscribe();
        } else {
            postAction$.subscribe();
        }
    }

    /* istanbul ignore next */
    dispatchUpdateThirdAction(updateThirdAction: UpdateAnAction) {
        this.store.dispatch(updateThirdAction);
    }

}
