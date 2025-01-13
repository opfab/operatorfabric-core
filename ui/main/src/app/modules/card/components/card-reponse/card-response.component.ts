/* Copyright (c) 2022-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Component, EventEmitter, Input, OnChanges, OnInit, Output, TemplateRef, ViewChild} from '@angular/core';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NgbModal, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import {Card} from '@ofServices/cards/model/Card';
import {CardAction} from '@ofModel/light-card.model';
import {MessageLevel} from '@ofServices/alerteMessage/model/Message';
import {MultiSelectConfig} from 'app/modules/share/multi-select/model/MultiSelect';
import {PermissionEnum} from '@ofServices/groups/model/PermissionEnum';
import {State} from '@ofServices/processes/model/Processes';
import {User} from '@ofServices/users/model/User';
import {EntitiesService} from '@ofServices/entities/EntitiesService';
import {ProcessesService} from '@ofServices/processes/ProcessesService';
import {UserPermissionsService} from '@ofServices/userPermissions/UserPermissionsService';
import {UsersService} from '@ofServices/users/UsersService';
import {Utilities} from 'app/business/common/utilities';
import {AlertMessageService} from '@ofServices/alerteMessage/AlertMessageService';
import {LoggerService as logger} from 'app/services/logs/LoggerService';
import {NgIf} from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';
import {MultiSelectComponent} from '../../../share/multi-select/multi-select.component';
import {CardTemplateGateway} from '@ofServices/templateGateway/CardTemplateGateway';
import {CardResponseService} from '@ofServices/cardResponse/CardResponseService';

class FormResult {
    valid: boolean;
    errorMsg: string;
    responseCardData: any;
    publisher?: string;
    responseState?: string;
    actions?: CardAction[];
}

const enum ResponseI18nKeys {
    FORM_ERROR_MSG = 'response.error.form',
    SUBMIT_ERROR_MSG = 'response.error.submit',
    SUBMIT_SUCCESS_MSG = 'response.submitSuccess'
}

@Component({
    selector: 'of-card-response',
    templateUrl: './card-response.component.html',
    standalone: true,
    imports: [NgIf, TranslateModule, FormsModule, ReactiveFormsModule, MultiSelectComponent]
})
export class CardResponseComponent implements OnChanges, OnInit {
    @Input() card: Card;
    @Input() cardState: State;
    @Input() lttdExpiredIsTrue: boolean;
    @Input() isResponseLocked: boolean;

    @Output() unlockAnswerEvent: EventEmitter<boolean> = new EventEmitter<boolean>();

    @ViewChild('chooseEntitiesForResponsePopup') chooseEntitiesForResponsePopupRef: TemplateRef<any>;

    private selectEntitiesForm: FormGroup<{
        entities: FormControl<[] | null>;
    }>;

    public showButton = false;
    public isUserEnabledToRespond = false;
    public isEntityFormFilled = true;
    public sendingResponseInProgress: boolean;

    private entityChoiceModal: NgbModalRef;
    private userEntitiesAllowedToRespond = [];
    private userEntityOptionsDropdownList = [];
    private userEntityIdToUseForResponse = '';

    public user: User;
    public multiSelectConfig: MultiSelectConfig = {
        labelKey: 'shared.entity',
        multiple: true,
        search: true
    };
    public btnValidateLabel = 'response.btnValidate';
    public btnUnlockLabel = 'response.btnUnlock';
    isReadOnlyUser: boolean;

    constructor(private readonly modalService: NgbModal) {
        const userWithPerimeters = UsersService.getCurrentUserWithPerimeters();
        if (userWithPerimeters) this.user = userWithPerimeters.userData;
    }

    ngOnInit() {
        this.selectEntitiesForm = new FormGroup({
            entities: new FormControl([])
        });
        this.disablePopUpButtonIfNoEntitySelected();
    }

    ngOnChanges(): void {
        this.isUserEnabledToRespond = UserPermissionsService.isUserEnabledToRespond(
            UsersService.getCurrentUserWithPerimeters(),
            this.card,
            ProcessesService.getProcess(this.card.process)
        );
        this.userEntitiesAllowedToRespond = UserPermissionsService.getUserEntitiesAllowedToRespond(
            UsersService.getCurrentUserWithPerimeters(),
            this.card,
            ProcessesService.getProcess(this.card.process)
        );
        this.isReadOnlyUser = UsersService.hasCurrentUserAnyPermission([PermissionEnum.READONLY]);

        this.showButton = this.cardState.response && !this.isReadOnlyUser;
        this.userEntityIdToUseForResponse = this.userEntitiesAllowedToRespond[0];
        this.setButtonLabels();
        this.computeEntityOptionsDropdownListForResponse();
    }

    private setButtonLabels() {
        this.btnValidateLabel = this.cardState.validateAnswerButtonLabel
            ? this.cardState.validateAnswerButtonLabel
            : 'response.btnValidate';
        this.btnUnlockLabel = this.cardState.modifyAnswerButtonLabel
            ? this.cardState.modifyAnswerButtonLabel
            : 'response.btnUnlock';
    }

    private disablePopUpButtonIfNoEntitySelected(): void {
        this.selectEntitiesForm.get('entities').valueChanges.subscribe((selectedEntities) => {
            this.isEntityFormFilled = selectedEntities.length >= 1;
        });
    }

    private computeEntityOptionsDropdownListForResponse(): void {
        this.userEntityOptionsDropdownList = [];
        if (this.userEntitiesAllowedToRespond) {
            this.userEntitiesAllowedToRespond.forEach((entityId) => {
                const entity = EntitiesService.getEntities().find((e) => e.id === entityId);
                this.userEntityOptionsDropdownList.push({value: entity.id, label: entity.name});
            });
        }
        this.userEntityOptionsDropdownList.sort((a, b) => Utilities.compareObj(a.label, b.label));
    }

    public processClickOnSendResponse() {
        const responseData: FormResult = CardTemplateGateway.getUserResponseFromTemplate(undefined);

        if (this.userEntitiesAllowedToRespond.length > 1 && !responseData.publisher) this.displayEntitiesChoicePopup();
        else this.submitResponse();
    }

    private displayEntitiesChoicePopup() {
        this.userEntityIdToUseForResponse = '';
        this.selectEntitiesForm.get('entities').setValue(this.userEntityOptionsDropdownList[0].value);
        this.entityChoiceModal = this.modalService.open(this.chooseEntitiesForResponsePopupRef, {centered: true});
    }

    private submitResponse() {
        const responseData: FormResult = CardTemplateGateway.getUserResponseFromTemplate(
            this.userEntityIdToUseForResponse
        );

        if (responseData.valid) {
            const publisherEntity = responseData.publisher ?? this.userEntityIdToUseForResponse;
            responseData.publisher = publisherEntity;
            this.sendingResponseInProgress = true;
            CardResponseService.sendResponse(this.card, responseData)
                .then(() => {
                    this.sendingResponseInProgress = false;
                    this.isResponseLocked = true;
                    this.displayMessage(ResponseI18nKeys.SUBMIT_SUCCESS_MSG, null, MessageLevel.INFO);
                })
                .catch((error) => {
                    this.sendingResponseInProgress = false;
                    logger.error(error);
                    this.displayMessage(ResponseI18nKeys.SUBMIT_ERROR_MSG, null, MessageLevel.ERROR);
                });
        } else {
            responseData.errorMsg && responseData.errorMsg !== ''
                ? this.displayMessage(responseData.errorMsg, null, MessageLevel.ERROR)
                : this.displayMessage(ResponseI18nKeys.FORM_ERROR_MSG, null, MessageLevel.ERROR);
        }
    }
    private displayMessage(i18nKey: string, msg: string, severity: MessageLevel = MessageLevel.ERROR) {
        AlertMessageService.sendAlertMessage({message: msg, level: severity, i18n: {key: i18nKey}});
    }

    public submitEntitiesChoice() {
        this.entityChoiceModal.dismiss();

        this.getSelectedEntities().forEach((selectedEntity) => {
            this.userEntityIdToUseForResponse = selectedEntity;
            this.submitResponse();
        });
    }

    public getSelectedEntities() {
        return this.selectEntitiesForm.value['entities'];
    }

    public cancelEntitiesChoice(): void {
        this.entityChoiceModal.dismiss();
    }

    public unlockAnswer() {
        this.unlockAnswerEvent.emit(true);
    }
}
