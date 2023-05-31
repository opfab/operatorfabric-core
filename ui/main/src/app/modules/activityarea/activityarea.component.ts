/* Copyright (c) 2022-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {UserService} from 'app/business/services/user.service';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {NgbModalRef} from '@ng-bootstrap/ng-bootstrap/modal/modal-ref';
import {FormControl, FormGroup} from '@angular/forms';
import {SettingsService} from 'app/business/services/settings.service';
import {EntitiesService} from 'app/business/services/entities.service';
import {LightCardsStoreService} from 'app/business/services/lightcards/lightcards-store.service';
import {ActivityAreaView} from 'app/business/view/activityarea/activityarea.view';
import {ActivityAreaPage} from 'app/business/view/activityarea/activityareaPage';

@Component({
    selector: 'of-activityarea',
    templateUrl: './activityarea.component.html',
    styleUrls: ['./activityarea.component.scss']
})
export class ActivityareaComponent implements OnInit, OnDestroy {
    @Input() titleI18nKey = 'activityArea.title';
    @Input() askConfirmation = true;
    @Output() confirm = new EventEmitter();

    activityAreaForm: FormGroup<{}>;
    saveSettingsInProgress = false;
    messageAfterSavingSettings: string;
    displaySendResultError = false;
    isScreenLoaded = false;

    confirmationPopup: NgbModalRef;

    activityAreaView: ActivityAreaView;
    activityAreaPage: ActivityAreaPage;

    constructor(
        private userService: UserService,
        private entitiesService: EntitiesService,
        private modalService: NgbModal,
        private settingsService: SettingsService,
        private lightCardStoreService: LightCardsStoreService
    ) {}

    ngOnInit() {
        this.activityAreaView = new ActivityAreaView(
            this.userService,
            this.entitiesService,
            this.settingsService,
            this.lightCardStoreService
        );
        this.activityAreaView.getActivityAreaPage().subscribe((page) => {
            this.activityAreaPage = page;
            this.initForm();
            this.isScreenLoaded = true;
        });
    }

    private initForm() {
        const lines = {};
        this.activityAreaPage.lines.forEach((line) => {
            if (line.isUserConnected) {
                lines[line.entityId] = new FormControl<boolean | null>(true);
            } else {
                lines[line.entityId] = new FormControl<boolean | null>(false);
            }
        });
        this.activityAreaForm = new FormGroup(lines);
    }

    confirmSaveSettings() {
        if (this.saveSettingsInProgress) return; // avoid multiple clicks
        this.saveSettingsInProgress = true;

        if (this.confirmationPopup) this.confirmationPopup.close(); // we close the confirmation popup

        for (const entityId of Object.keys(this.activityAreaForm.controls)) {
            const control = this.activityAreaForm.get(entityId);
            this.activityAreaView.setEntityConnected(entityId, control.value);
        }

        this.activityAreaView.saveActivityArea().subscribe((resp) => {
            this.saveSettingsInProgress = false;
            this.messageAfterSavingSettings = '';
            if (!resp) {
                this.messageAfterSavingSettings = 'shared.error.impossibleToSaveSettings';
                this.displaySendResultError = true;
            }
            if (this.confirmationPopup) this.confirmationPopup.close();
            this.confirm.emit();
        });
    }

    doNotConfirmSaveSettings() {
        // The modal must not be closed until the settings has been saved in the back
        // If not, with slow network, when user goes to the feed before the end of the request
        // it ends up with nothing in the feed
        // This happens because method this.lightCardStoreService.removeAllLightCards();
        // is called too late (in activityAreaView)
        if (!this.saveSettingsInProgress) this.confirmationPopup.close();
    }

    openConfirmSaveSettingsModal(content) {
        if (this.askConfirmation) this.confirmationPopup = this.modalService.open(content, {centered: true, backdrop: 'static'});
        else this.confirmSaveSettings();
    }

    ngOnDestroy() {
        this.activityAreaView.stopUpdateRegularyConnectedUser();
    }
}
