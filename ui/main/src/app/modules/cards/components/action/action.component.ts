/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Action, ActionStatus} from "@ofModel/thirds.model";
import {I18n} from "@ofModel/i18n.model";
import {Store} from "@ngrx/store";
import {AppState} from "@ofStore/index";
import {UpdateAnAction} from "@ofActions/light-card.actions";
import {map, takeUntil} from "rxjs/operators";
import {Subject} from "rxjs";
import * as _ from "lodash";

@Component({
    selector: 'of-action',
    templateUrl: './action.component.html',
    styleUrls: ['./action.component.scss']
})
export class ActionComponent implements OnInit, OnDestroy {

    @Input() readonly action: Action;
    @Input() readonly i18nPrefix: I18n;
    @Input() readonly lightCardId: string;
    @Input() readonly actionUrlPath: string;
    private url: string;
    private ngUnsubscribe: Subject<void> = new Subject<void>();

    constructor(private httpClient: HttpClient, private store: Store<AppState>) {
    }

    ngOnInit() {
        //TODO config || env || hard coded ????
        const protocol = 'http://';
        const domain = 'localhost';
        const port = '8080';
        const resource = `${this.actionUrlPath}/${(this.action.key)}`;
        this.url = `${protocol}${domain}:${port}${resource}`;
    }

    submit() {
        const status = this.action as ActionStatus;
        const checkIfReceivedStatusIsDifferentFromCurrentOne = map((currentStatus: ActionStatus) => {
            const hasChanged = !_.isEqual(status,currentStatus);
            return [hasChanged, currentStatus];
        });

        const dispatchStateActionOnStatusChanges = map(([hasChanged, currentStatus]: [boolean, ActionStatus]) => {
            if (hasChanged) {
                this.store.dispatch(
                    new UpdateAnAction({
                        cardId: this.lightCardId
                        , actionKey: this.action.key
                        , status: currentStatus
                    }));
            }
            return hasChanged
        });

        if (this.action.updateStateBeforeAction) {
            this.httpClient.get(this.url).pipe(
                takeUntil(this.ngUnsubscribe),
                checkIfReceivedStatusIsDifferentFromCurrentOne,
                dispatchStateActionOnStatusChanges
            ).subscribe();
        }

        this.httpClient.post(this.url, this.action).pipe(
            takeUntil(this.ngUnsubscribe),
            checkIfReceivedStatusIsDifferentFromCurrentOne,
            dispatchStateActionOnStatusChanges
        ).subscribe();
    }


    ngOnDestroy(): void {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }

}
