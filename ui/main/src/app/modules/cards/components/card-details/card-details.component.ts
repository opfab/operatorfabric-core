/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Component, OnInit} from '@angular/core';
import {Card, Detail, RecipientEnum} from '@ofModel/card.model';
import {Store} from '@ngrx/store';
import {AppState} from '@ofStore/index';
import * as cardSelectors from '@ofStore/selectors/card.selectors';
import {ThirdsService} from "@ofServices/thirds.service";
import { ClearLightCardSelection } from '@ofStore/actions/light-card.actions';
import { Router } from '@angular/router';
import {selectCurrentUrl} from '@ofStore/selectors/router.selectors';
import { ThirdResponse } from '@ofModel/thirds.model';
import { Map } from '@ofModel/map';
import { UserService } from '@ofServices/user.service';
import { selectIdentifier } from '@ofStore/selectors/authentication.selectors';
import { switchMap } from 'rxjs/operators';
import { Severity } from '@ofModel/light-card.model';
import { CardService } from '@ofServices/card.service';
declare const ext_form: any;

const RESPONSE_FORM_ERROR_MSG_I18N_KEY = 'response.error.form';
const RESPONSE_SUBMIT_ERROR_MSG_I18N_KEY = 'response.error.submit';
const RESPONSE_SUBMIT_SUCCESS_MSG_I18N_KEY = 'response.submitSuccess';
const RESPONSE_BUTTON_TITLE_I18N_KEY = 'response.btnTitle';

@Component({
    selector: 'of-card-details',
    templateUrl: './card-details.component.html',
    styleUrls: ['./card-details.component.scss']
})
export class CardDetailsComponent implements OnInit {

    protected _i18nPrefix: string;
    card: Card;
    details: Detail[];
    currentPath: any;
    responseData: ThirdResponse;
    messages = {
        submitError: {
            display: false,
            msg: RESPONSE_SUBMIT_ERROR_MSG_I18N_KEY,
            color: 'red'
        },
        formError: {
            display: false,
            msg: RESPONSE_FORM_ERROR_MSG_I18N_KEY,
            color: 'red'
        },
        submitSuccess: {
            display: false,
            msg: RESPONSE_SUBMIT_SUCCESS_MSG_I18N_KEY,
            color: 'green'
        }
    }

    constructor(private store: Store<AppState>,
        private thirdsService: ThirdsService,
        private userService: UserService,
        private cardService: CardService,
        private router: Router) {
    }

    get responseDataExists(): boolean {
        return this.responseData != null && this.responseData != undefined;
    }

    get i18nPrefix(): string {
        return this._i18nPrefix;
    }
     
    get btnColor(): string {
        return this.thirdsService.getResponseBtnColorEnumValue(this.responseData.btnColor);
    }
     
    get btnText(): string {
        return this.responseData.btnText ?
                    this.i18nPrefix + this.responseData.btnText.key : RESPONSE_BUTTON_TITLE_I18N_KEY;
    }

    get responseDataParameters(): Map<string> {
        return this.responseData.btnText ? this.responseData.btnText.parameters : undefined;
    }

    ngOnInit() {
        this.store.select(cardSelectors.selectCardStateSelected)
            .subscribe(card => {
                this.card = card;
                if (card) {
                    this._i18nPrefix = `${card.publisher}.${card.publisherVersion}.`;
                    if (card.details) {
                        this.details = [...card.details];
                    } else {
                        this.details = [];
                    }
                    this.thirdsService.queryThird(this.card.publisher, this.card.publisherVersion).subscribe(third => {
                            if (third) {
                                const state = third.extractState(this.card);
                                if (state != null) {
                                    this.details.push(...state.details);
                                }
                            }
                        },
                        error => console.log(`something went wrong while trying to fetch third for ${this.card.publisher} with ${this.card.publisherVersion} version.`))
                    ;
                }
            });
            this.store.select(selectCurrentUrl).subscribe(url => {
                if (url) {
                    const urlParts = url.split('/');
                    this.currentPath = urlParts[1];
                }
            });
    }
    closeDetails() {
        this.store.dispatch(new ClearLightCardSelection());
        this.router.navigate(['/' + this.currentPath, 'cards']);
    }

    getResponseData($event) {
        this.responseData = $event;
    }

    submitResponse() {

        let formData = {};

        var formElement = document.getElementById("opfab-form") as HTMLFormElement;
        for (let [key, value] of [...new FormData(formElement)]) {
            (key in formData) ? formData[key].push(value) : formData[key] = [value];
        }
        console.log(formData);
        
        ext_form.validyForm(formData);
        
        if (ext_form.isValid) {

            this.store.select(selectIdentifier)
                .pipe(
                    switchMap(id => this.userService.askUserApplicationRegistered(id))
                )
                .subscribe(user => {

                    const card: Card = {
                        uid: null,
                        id: null,
                        publishDate: null,
                        publisher: user.entities[0],
                        publisherVersion: this.card.publisherVersion,
                        process: this.card.process,
                        processId: this.card.processId,
                        state: this.responseData.state,
                        startDate: this.card.startDate,
                        endDate: this.card.endDate,
                        severity: Severity.INFORMATION,
                        entityRecipients: this.card.entityRecipients,
                        externalRecipients: [this.card.publisher],
                        title: this.card.title,
                        summary: this.card.summary,
                        data: formData,
                        recipient: {
                            type: RecipientEnum.USER,
                            identity: 'admin'
                        }
                        // parentCardId: this.card.id
                    }

                    this.cardService.postResponseCard(card)
                        .subscribe(
                            rep => {
                                console.log(rep);
                                this.messages.formError.display = false;
                                this.messages.submitSuccess.display = true;
                            },
                            err => {
                                this.messages.submitError.display = true;
                                console.error(err);
                            }
                        )
                });
        
        } else {

            this.messages.formError.display = true;
            this.messages.formError.msg = (ext_form.formErrorMsg && ext_form.formErrorMsg != '') ?
                                                ext_form.formErrorMsg : RESPONSE_FORM_ERROR_MSG_I18N_KEY;
        }
    }
}
