/* Copyright (c) 2022-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {NgbModalRef} from '@ng-bootstrap/ng-bootstrap/modal/modal-ref';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {ActivityAreaView} from 'app/business/view/activityarea/activityarea.view';
import {ActivityAreaPage} from 'app/business/view/activityarea/activityareaPage';
import {Subject, firstValueFrom, takeUntil} from 'rxjs';
import {ModalService} from 'app/business/services/modal.service';
import {TranslateModule} from '@ngx-translate/core';
import {NgIf, NgFor} from '@angular/common';
import {SpinnerComponent} from '../share/spinner/spinner.component';

@Component({
    selector: 'of-activityarea',
    templateUrl: './activityarea.component.html',
    styleUrls: ['./activityarea.component.scss'],
    standalone: true,
    imports: [TranslateModule, NgIf, SpinnerComponent, FormsModule, ReactiveFormsModule, NgFor]
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

    private canDeactivateSubject = new Subject<boolean>();
    private ngUnsubscribe$ = new Subject<void>();

    constructor(private modalService: NgbModal) {}

    ngOnInit() {
        this.activityAreaView = new ActivityAreaView();
        this.activityAreaView.getActivityAreaPage().subscribe((page) => {
            this.activityAreaPage = page;
            this.initForm();
            this.isScreenLoaded = true;
            this.listenToFormChanges();
        });
    }

    private initForm() {
        const lines = {};
        this.activityAreaPage.activityAreaClusters.forEach((cluster) => {
            cluster.lines.forEach((line) => {
                if (line.isUserConnected) {
                    lines[line.entityId] = new FormControl<boolean | null>(true);
                } else {
                    lines[line.entityId] = new FormControl<boolean | null>(false);
                }
            });
        });
        this.activityAreaForm = new FormGroup(lines, {updateOn: 'change'});
    }

    private listenToFormChanges() {
        Object.keys(this.activityAreaForm.controls).forEach((key) => {
            this.activityAreaForm
                .get(key)
                .valueChanges.pipe(takeUntil(this.ngUnsubscribe$))
                .subscribe((value) => {
                    this.activityAreaView.setEntityConnected(key, value);
                });
        });
    }

    async confirmSaveSettings() {
        if (this.saveSettingsInProgress) return; // avoid multiple clicks
        this.saveSettingsInProgress = true;

        if (this.confirmationPopup) {
            this.confirmationPopup.close();
        }

        const resp = await firstValueFrom(this.activityAreaView.saveActivityArea());
        this.saveSettingsInProgress = false;
        this.messageAfterSavingSettings = '';
        if (!resp) {
            this.messageAfterSavingSettings = 'shared.error.impossibleToSaveSettings';
            this.displaySendResultError = true;
        }
        if (this.confirmationPopup) {
            this.confirmationPopup.close();
        }
        this.confirm.emit();
    }

    doNotConfirmSaveSettings() {
        // The modal must not be closed until the settings have been saved in the back
        // If not, with slow network, when user goes to the feed before the end of the request
        // it results with nothing in the feed
        // This happens because the method this.LightCardsStoreService.removeAllLightCards();
        // is called too late (in activityAreaView)
        if (!this.saveSettingsInProgress) {
            this.confirmationPopup.close();
        }
    }

    openConfirmSaveSettingsModal(content) {
        if (this.askConfirmation && this.activityAreaView.doesActivityAreasNeedToBeSaved()) {
            this.confirmationPopup = this.modalService.open(content, {centered: true, backdrop: 'static'});
        } else {
            this.confirmSaveSettings();
        }
    }

    isEllipsisActive(id: string): boolean {
        const element = document.getElementById(id);
        return element.offsetWidth < element.scrollWidth;
    }

    canDeactivate() {
        if (this.activityAreaView.doesActivityAreasNeedToBeSaved()) {
            ModalService.openSaveBeforeExitModal().then(async (result) => {
                switch (result) {
                    case 'save':
                        await this.confirmSaveSettings();
                        this.canDeactivateSubject.next(true);
                        break;
                    case 'cancel':
                        this.canDeactivateSubject.next(false);
                        break;
                    default:
                        this.canDeactivateSubject.next(true);
                        break;
                }
            });
            return this.canDeactivateSubject;
        }
        return true;
    }

    ngOnDestroy() {
        this.activityAreaView.stopUpdateRegularyConnectedUser();
    }
}
