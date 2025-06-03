/* Copyright (c) 2022-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {ActivityAreaView} from 'app/views/activityarea/ActivityAreaView';
import {ActivityAreaPage} from 'app/views/activityarea/ActivityAreaPage';
import {Subject, firstValueFrom, takeUntil} from 'rxjs';
import {ModalService} from '@ofServices/modal/ModalService';
import {TranslateModule} from '@ngx-translate/core';
import {NgIf, NgFor} from '@angular/common';
import {SpinnerComponent} from '../share/spinner/SpinnerComponent';
import {I18n} from '../../model/I18n';

@Component({
    selector: 'of-activityarea',
    templateUrl: './ActivityAreaComponent.html',
    styleUrls: ['./ActivityAreaComponent.scss'],
    imports: [TranslateModule, NgIf, SpinnerComponent, FormsModule, ReactiveFormsModule, NgFor]
})
export class ActivityAreaComponent implements OnInit, OnDestroy {
    @Input() titleI18nKey = 'activityArea.title';
    @Input() askConfirmation = true;
    @Output() confirm = new EventEmitter();
    @ViewChild('opfabActivityAreaScreen') rootElement: ElementRef;

    activityAreaForm: FormGroup<{}>;
    saveSettingsInProgress = false;
    messageAfterSavingSettings: string;
    displaySendResultError = false;
    isScreenLoaded = false;

    activityAreaView: ActivityAreaView;
    activityAreaPage: ActivityAreaPage;

    private readonly canDeactivateSubject = new Subject<boolean>();
    private readonly ngUnsubscribe$ = new Subject<void>();

    ngOnInit() {
        this.activityAreaView = new ActivityAreaView();
        this.activityAreaView.setFunctionToSetClusterLineCheckBoxValue(
            (clusterId: string, entityId: string, checked: boolean) => {
                this.setCheckboxInputValue('opfab_activity_area_line_' + clusterId + '_' + entityId, checked);
            }
        );
        this.activityAreaView.setFunctionToSetClusterCheckBoxValue((clusterId: string, checked: boolean) => {
            this.setCheckboxInputValue('opfab_activity_area_cluster_' + clusterId, checked);
        });
        this.activityAreaView.getActivityAreaPage().subscribe((page) => {
            this.activityAreaPage = page;
            this.initForm();
            this.isScreenLoaded = true;
            this.listenToFormChanges();
        });
    }

    private setCheckboxInputValue(elementId: string, checked: boolean) {
        const element = this.rootElement.nativeElement.querySelector('#' + elementId);
        if (element) {
            element.checked = checked;
        }
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

        const resp = await firstValueFrom(this.activityAreaView.saveActivityArea());
        this.saveSettingsInProgress = false;
        this.messageAfterSavingSettings = '';
        if (!resp) {
            this.messageAfterSavingSettings = 'shared.error.impossibleToSaveSettings';
            this.displaySendResultError = true;
        }
        this.confirm.emit();
    }

    openConfirmSaveSettingsModal() {
        if (this.askConfirmation && this.activityAreaView.doesActivityAreasNeedToBeSaved()) {
            ModalService.openConfirmationModal(
                new I18n('shared.popup.title'),
                new I18n('shared.popup.areYouSure')
            ).then((confirm) => {
                if (confirm) {
                    this.confirmSaveSettings();
                }
            });
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
