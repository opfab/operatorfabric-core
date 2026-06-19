/* Copyright (c) 2024-2026, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {NotificationConfigurationView} from 'app/components/notificationconfiguration/view/NotificationConfigurationView';
import {NotificationConfigurationPage} from 'app/components/notificationconfiguration/view/NotificationConfigurationPage';
import {TranslateDirective} from '@ngx-translate/core';
import {NgTemplateOutlet} from '@angular/common';

@Component({
    selector: 'of-notificationconfiguration',
    templateUrl: './NotificationConfigurationComponent.html',
    styleUrls: ['./NotificationConfigurationComponent.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [TranslateDirective, NgTemplateOutlet]
})
export class NotificationConfigurationComponent implements OnInit, AfterViewInit {
    notificationConfigurationView: NotificationConfigurationView;
    notificationConfigurationPage: NotificationConfigurationPage;
    @ViewChild('opfabNotificationConfigurationScreen') rootElement: ElementRef;

    constructor() {
        this.notificationConfigurationView = new NotificationConfigurationView();
    }
    ngOnInit() {
        this.notificationConfigurationView.setFunctionToSetProcessCheckBoxValue((processId, checked) => {
            this.setCheckboxInputValue(`opfab_notification_process_${processId}`, checked);
        });
        this.notificationConfigurationView.setFunctionToSetProcessStateCheckBoxValue((processId, stateId, checked) => {
            this.setCheckboxInputValue(String.raw`opfab_notification_state_${processId}\.${stateId}`, checked); // dot is to be escaped in id selector
        });
        this.notificationConfigurationView.setFunctionToSetProcessGroupCheckBoxValue((processGroupId, checked) => {
            this.setCheckboxInputValue(`opfab_notification_processgroup_${processGroupId}`, checked);
        });
        this.notificationConfigurationView.setFunctionToSetEmailEnabled(this.setEmailEnabled.bind(this));
        this.notificationConfigurationPage = this.notificationConfigurationView.getNotificationConfigurationPage();
    }

    private setCheckboxInputValue(elementId: string, checked: boolean) {
        const element = this.rootElement.nativeElement.querySelector(`#${elementId}`);
        if (element) {
            element.checked = checked;
        }
    }

    private setEmailEnabled(processId: string, stateId: string, emailEnabled: boolean) {
        const imageDiv = this.rootElement.nativeElement.querySelector(
            String.raw`#opfab_email_notification_state_div_${processId}\.${stateId}` // dot is to be escaped in id selector
        );
        const imageTd = this.rootElement.nativeElement.querySelector(
            String.raw`#opfab_email_notification_state_td_${processId}\.${stateId}` // dot is to be escaped in id selector
        );
        if (emailEnabled) {
            imageTd?.classList.remove('opfab-notificationconfiguration-slash');
            imageDiv?.classList.remove('opfab-notificationconfiguration-icon-envelope-with-slash');
            imageDiv?.classList.add('opfab-notificationconfiguration-icon-envelope-without-slash');
        } else {
            imageTd?.classList.add('opfab-notificationconfiguration-slash');
            imageDiv?.classList.remove('opfab-notificationconfiguration-icon-envelope-without-slash');
            imageDiv?.classList.add('opfab-notificationconfiguration-icon-envelope-with-slash');
        }
    }

    ngAfterViewInit() {
        this.initEmailEnabled();
        this.notificationConfigurationView.manageNotNotifiedStatesWithFilteringNotificationNotAllowed();
    }

    private initEmailEnabled() {
        this.notificationConfigurationPage.processGroups.forEach((processGroup) => {
            processGroup.processes.forEach((process) => {
                process.states.forEach((state) => {
                    this.setEmailEnabled(process.id, state.id, state.notificationByEmail);
                });
            });
        });
        this.notificationConfigurationPage.processesWithNoProcessGroup.forEach((process) => {
            process.states.forEach((state) => {
                this.setEmailEnabled(process.id, state.id, state.notificationByEmail);
            });
        });
    }
}
