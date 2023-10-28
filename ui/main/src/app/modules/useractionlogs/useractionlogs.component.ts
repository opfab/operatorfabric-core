/* Copyright (c) 2022-2023, RTE (http://www.rte-france.com)
 *  See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {AbstractControl, FormControl, FormGroup} from '@angular/forms';
import {NgbModal, NgbModalOptions, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import {Card} from '@ofModel/card.model';
import {DateTimeNgb} from '@ofModel/datetime-ngb.model';
import {MultiSelectConfig, MultiSelectOption} from '@ofModel/multiselect.model';
import {UserActionLogsServer} from 'app/business/server/user-action-logs.server';
import {CardService} from 'app/business/services/card/card.service';
import {TranslationService} from 'app/business/services/translation/translation.service';
import {UserActionLogsView} from 'app/business/view/useractionlogs/userActionLogs.view';
import {UserActionLogsResult} from 'app/business/view/useractionlogs/userActionLogsResult';
import {UserActionLogsPageDescription} from 'app/business/view/useractionlogs/userActionLogsPageDescription';

@Component({
    selector: 'of-useractionlogs',
    templateUrl: './useractionlogs.component.html',
    styleUrls: ['./useractionlogs.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserActionLogsComponent implements OnInit {
    userActionLogsView: UserActionLogsView;
    userActionLogsPage: UserActionLogsPageDescription;
    userActionLogsResult: UserActionLogsResult;

    userActionLogsForm: FormGroup;
    loginMultiSelectConfig: MultiSelectConfig;
    actionsMultiSelectConfig: MultiSelectConfig;

    logins: Array<MultiSelectOption> = [];
    actions = [];
    loginsSelected = [];
    actionsSelected = [];
    loginListLoaded = false;
    loadingInProgress = false;
    initialDateFrom;
    errorMessage;
    currentResultPage = 1;

    // View card
    modalRef: NgbModalRef;
    @ViewChild('cardDetail') cardDetailTemplate: ElementRef;
    cardLoadingInProgress = false;
    selectedCard: Card;
    selectedChildCards: Card[];

    constructor(
        translationService: TranslationService,
        userActionLogsServer: UserActionLogsServer,
        cardService: CardService,
        private modalService: NgbModal,
        private changeDetector: ChangeDetectorRef
    ) {
        this.userActionLogsView = new UserActionLogsView(
            translationService,
            userActionLogsServer,
            cardService
        );
        this.userActionLogsPage = this.userActionLogsView.getUserActionLogPage();
    }

    ngOnInit() {
        this.initForm();
        this.setInitialDateFrom();
        this.initActionMultiselect();
        this.initLoginMultiselect();
    }

    private initForm() {
        this.userActionLogsForm = new FormGroup({
            login: new FormControl([]),
            action: new FormControl([]),
            dateFrom: new FormControl<string | null>(null),
            dateTo: new FormControl('')
        });
    }

    private setInitialDateFrom() {
        const initDate = this.userActionLogsPage.initialFromDate;
        this.initialDateFrom = {
            day: initDate.getDate(),
            month: initDate.getMonth() + 1,
            year: initDate.getFullYear()
        };
    }

    private initLoginMultiselect() {
        this.loginMultiSelectConfig = {
            labelKey: 'useractionlogs.filters.login',
            placeholderKey: 'useractionlogs.login',
            sortOptions: true,
            nbOfDisplayValues: 1
        };
        this.userActionLogsView.getAllUserLogins().subscribe((loginList) => {
            loginList.forEach((login) => this.logins.push(new MultiSelectOption(login, login)));
            this.loginListLoaded = true;
            this.changeDetector.markForCheck();
        });
    }

    private initActionMultiselect() {
        this.actionsMultiSelectConfig = {
            labelKey: 'useractionlogs.filters.action',
            placeholderKey: 'useractionlogs.action',
            sortOptions: true,
            nbOfDisplayValues: 1
        };
        this.userActionLogsPage.actionList.forEach((action) =>
            this.actions.push(new MultiSelectOption(action, action))
        );
    }

    search(page) {
        const logins = this.userActionLogsForm.get('login').value;
        const actions = this.userActionLogsForm.get('action').value;
        const dateFrom = this.extractDateAndTime(this.userActionLogsForm.get('dateFrom'));
        const dateTo = this.extractDateAndTime(this.userActionLogsForm.get('dateTo'));
        this.userActionLogsView.setSelectedLogins(logins);
        this.userActionLogsView.setSelectedActions(actions);
        this.userActionLogsView.setDateFrom(dateFrom);
        this.userActionLogsView.setDateTo(dateTo);
        if (page) {
            this.userActionLogsView.setPageNumber(page);
            this.currentResultPage = page + 1;
        } else {
            this.userActionLogsView.setPageNumber(0);
            this.currentResultPage = 1;
        }
        this.loadingInProgress = true;
        this.userActionLogsResult = null;
        this.errorMessage = null;
        this.userActionLogsView.search().subscribe((result) => {
            if (result.hasError) this.errorMessage = result.errorMessage;
            else this.userActionLogsResult = result;
            this.loadingInProgress = false;
            this.changeDetector.markForCheck();
        });
    }

    private extractDateAndTime(form: AbstractControl) {
        const val = form.value;
        if (!val || val === '') {
            return null;
        }

        if (isNaN(val.time.hour)) {
            val.time.hour = 0;
        }
        if (isNaN(val.time.minute)) {
            val.time.minute = 0;
        }
        if (isNaN(val.time.second)) {
            val.time.second = 0;
        }

        const converter = new DateTimeNgb(val.date, val.time);
        return converter.convertToNumber();
    }

    changePage(page) {
        this.search(page - 1);
    }

    clickOnCard(cardUid) {
        if (cardUid) {
            this.cardLoadingInProgress = true;
            this.userActionLogsView.getCard(cardUid).subscribe((card) => {
                this.cardLoadingInProgress = false;
                if (card) {
                    this.selectedCard = card.card;
                    this.selectedChildCards = card.childCards;

                    const options: NgbModalOptions = {
                        size: 'fullscreen'
                    };
                    if (this.modalRef) this.modalRef.close();
                    this.modalRef = this.modalService.open(this.cardDetailTemplate, options);
                } else {
                    if (this.modalRef) this.modalRef.close();
                }
            });
        }
    }

    reset() {
        this.userActionLogsForm.reset();
        this.loginsSelected = [];
        this.actionsSelected = [];
        this.userActionLogsResult = null;
        this.errorMessage = null;
    }
}
