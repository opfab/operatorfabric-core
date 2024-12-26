/* Copyright (c) 2018-2024, RTE (http://www.rte-france.com)
 * Copyright (c) 2023, Alliander (http://www.alliander.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {TranslateService, TranslateModule} from '@ngx-translate/core';
import {SettingsView} from 'app/business/view/settings/settings.view';
import {FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MultiSelectConfig} from '@ofModel/multiselect.model';
import {Subject, takeUntil} from 'rxjs';
import {ServerResponseStatus} from 'app/business/server/serverResponse';
import {ModalService} from '@ofServices/modal/ModalService';
import {I18n} from '@ofModel/i18n.model';
import {ErrorService} from 'app/business/services/error-service';
import {AlertMessageService} from '@ofServices/alerteMessage/AlertMessageService';
import {MessageLevel} from '@ofServices/alerteMessage/model/Message';
import {NgIf} from '@angular/common';
import {MultiSelectComponent} from '../../../share/multi-select/multi-select.component';

@Component({
    selector: 'of-settings',
    templateUrl: './settings.component.html',
    styleUrls: ['./settings.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [TranslateModule, FormsModule, ReactiveFormsModule, NgIf, MultiSelectComponent]
})
export class SettingsComponent implements OnInit, OnDestroy {
    settingsForm: FormGroup;
    settingsView = new SettingsView();
    isExternalDeviceSettingVisible = false;

    languageOptionList: {value: string; label: string}[];
    languageSelectedOption = new Array();
    languageMultiSelectConfig: MultiSelectConfig;

    timezoneForEmailsMultiSelectConfig: MultiSelectConfig;
    timezoneForEmailsOptionList: {value: string; label: string}[];
    timezoneForEmailsSelectedOption = new Array();

    saveSettingsInProgress = false;
    private readonly ngUnsubscribe$ = new Subject<void>();
    canDeactivateSubject = new Subject<boolean>();
    pendingModification: boolean;
    constructor(
        private readonly translateService: TranslateService,
        private readonly changeDetector: ChangeDetectorRef
    ) {}

    ngOnInit(): void {
        this.getExternalDeviceSettingVisibility();
        this.initForm();
        this.listenToFormChanges();
    }

    private getExternalDeviceSettingVisibility() {
        this.settingsView.isExternalDeviceSettingVisible().then((result) => {
            this.isExternalDeviceSettingVisible = result;
            this.changeDetector.markForCheck();
        });
    }

    private initForm() {
        const settings = [
            'playSoundForAlarm',
            'playSoundForAction',
            'playSoundForCompliant',
            'playSoundForInformation',
            'replayEnabled',
            'playSoundOnExternalDevice',
            'replayInterval',
            'systemNotificationAlarm',
            'systemNotificationAction',
            'systemNotificationCompliant',
            'systemNotificationInformation',
            'locale',
            'sendCardsByEmail',
            'emailToPlainText',
            'sendDailyEmail',
            'sendWeeklyEmail',
            'email',
            'timezoneForEmails',
            'hallwayMode',
            'showAcknowledgmentFooter',
            'openNextCardOnAcknowledgment',
            'remoteLoggingEnabled'
        ];

        const formGroupConfig = {};
        settings.forEach((setting) => {
            if (setting === 'email')
                formGroupConfig[setting] = new FormControl(this.settingsView.getSetting(setting), Validators.email);
            else formGroupConfig[setting] = new FormControl(this.settingsView.getSetting(setting));
        });
        this.settingsForm = new FormGroup(formGroupConfig, {updateOn: 'change'});
        this.initLocaleMultiselect();
        this.initTimezoneForEmailsMultiselect();
    }

    private initLocaleMultiselect() {
        this.languageMultiSelectConfig = {
            labelKey: 'settings.locale',
            multiple: false,
            search: false,
            sortOptions: true
        };

        const locales = this.translateService.getLangs();
        this.languageOptionList = locales.map((locale) => ({value: locale, label: locale}));
        this.languageSelectedOption[0] = this.settingsView.getSetting('locale');
    }

    private initTimezoneForEmailsMultiselect() {
        this.timezoneForEmailsMultiSelectConfig = {
            labelKey: 'settings.timezoneForEmails',
            multiple: false,
            search: true,
            sortOptions: true
        };

        this.timezoneForEmailsOptionList = Intl.supportedValuesOf('timeZone').map((timezone) => ({
            value: timezone,
            label: timezone
        }));
        this.timezoneForEmailsSelectedOption[0] = this.settingsView.getSetting('timezoneForEmails');
    }

    private listenToFormChanges() {
        Object.keys(this.settingsForm.controls).forEach((key) => {
            this.settingsForm
                .get(key)
                .valueChanges.pipe(takeUntil(this.ngUnsubscribe$))
                .subscribe((value) => {
                    this.settingsView.setSetting(key, value);
                });
        });
    }

    private validateNumericInput(inputElement: HTMLInputElement) {
        inputElement.value = inputElement.value.replace(/\D/, '');
    }

    ngOnDestroy(): void {
        this.ngUnsubscribe$.next();
        this.ngUnsubscribe$.complete();
    }

    saveSettings() {
        if (this.saveSettingsInProgress) return; // avoid multiple clicks
        if (!this.settingsView.isEmailAndEmailCheckboxesCoherent()) {
            AlertMessageService.sendAlertMessage({
                message: '',
                i18n: {key: 'settings.input.errors.emailAddressMissing'},
                level: MessageLevel.ERROR
            });
            return;
        }
        this.saveSettingsInProgress = true;
        this.settingsView.saveSettings().then((result) => {
            this.saveSettingsInProgress = false;
            if (result.status === ServerResponseStatus.OK)
                ModalService.openInformationModal(new I18n('settings.settingsSaved')).then(() => {
                    this.canDeactivateSubject.next(true);
                });
            else {
                ErrorService.handleServerResponseError(result);
            }
        });
    }

    canDeactivate() {
        if (this.settingsView.doesSettingsNeedToBeSaved()) {
            if (this.settingsForm.invalid) {
                ModalService.openInformationModal(new I18n('settings.invalidSettings')).then(() => {
                    this.canDeactivateSubject.next(false);
                });
            } else {
                ModalService.openSaveBeforeExitModal().then((result) => {
                    switch (result) {
                        case 'save':
                            this.saveSettings();
                            break;
                        case 'cancel':
                            this.canDeactivateSubject.next(false);
                            break;
                        default:
                            this.canDeactivateSubject.next(true);
                            break;
                    }
                });
            }
            return this.canDeactivateSubject;
        }
        return true;
    }

    get email() {
        return this.settingsForm.get('email');
    }
}
