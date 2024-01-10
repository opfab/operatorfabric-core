/* Copyright (c) 2022-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Component, EventEmitter, Input, OnChanges, OnInit, Output, TemplateRef, ViewChild} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {NgbModal, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import {Card, CardForPublishing} from '@ofModel/card.model';
import {Severity} from '@ofModel/light-card.model';
import {MessageLevel} from '@ofModel/message.model';
import {MultiSelectConfig} from '@ofModel/multiselect.model';
import {PermissionEnum} from '@ofModel/permission.model';
import {State} from '@ofModel/processes.model';
import {User} from '@ofModel/user.model';
import {EntitiesService} from 'app/business/services/users/entities.service';
import {ProcessesService} from 'app/business/services/businessconfig/processes.service';
import {UserPermissionsService} from 'app/business/services/user-permissions.service';
import {UserService} from 'app/business/services/users/user.service';
import {Utilities} from 'app/business/common/utilities';
import {AlertMessageService} from 'app/business/services/alert-message.service';
import {CardService} from 'app/business/services/card/card.service';
import {ServerResponseStatus} from 'app/business/server/serverResponse';
import {OpfabAPIService} from 'app/business/services/opfabAPI.service';
import {LoggerService as logger} from 'app/business/services/logs/logger.service';

class FormResult {
    valid: boolean;
    errorMsg: string;
    responseCardData: any;
    publisher?: string
    responseState?: string;
}

const enum ResponseI18nKeys {
    FORM_ERROR_MSG = 'response.error.form',
    SUBMIT_ERROR_MSG = 'response.error.submit',
    SUBMIT_SUCCESS_MSG = 'response.submitSuccess'
}

@Component({
    selector: 'of-card-response',
    templateUrl: './card-response.component.html'
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

    constructor(
        private modalService: NgbModal,
        private opfabAPIService: OpfabAPIService

    ) {
        const userWithPerimeters = UserService.getCurrentUserWithPerimeters();
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
            UserService.getCurrentUserWithPerimeters(),
            this.card,
            ProcessesService.getProcess(this.card.process)
        );
        this.userEntitiesAllowedToRespond = UserPermissionsService.getUserEntitiesAllowedToRespond(
            UserService.getCurrentUserWithPerimeters(),
            this.card,
            ProcessesService.getProcess(this.card.process)
        );
        this.isReadOnlyUser = UserService.hasCurrentUserAnyPermission([PermissionEnum.READONLY]);

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
        })
    }

    private computeEntityOptionsDropdownListForResponse(): void {
        this.userEntityOptionsDropdownList = [];
        if(this.userEntitiesAllowedToRespond) {
            this.userEntitiesAllowedToRespond.forEach((entityId) => {
                const entity = EntitiesService.getEntities().find((e) => e.id === entityId);
                this.userEntityOptionsDropdownList.push({value: entity.id, label: entity.name});
            });
        }
        this.userEntityOptionsDropdownList.sort((a, b) => Utilities.compareObj(a.label, b.label));
    }

    public processClickOnSendResponse() {
        const responseData: FormResult = this.opfabAPIService.templateInterface.getUserResponse();

        if (this.userEntitiesAllowedToRespond.length > 1 && !responseData.publisher) this.displayEntitiesChoicePopup();
        else this.submitResponse();
    }

    private displayEntitiesChoicePopup() {
        this.userEntityIdToUseForResponse = '';
        this.selectEntitiesForm.get('entities').setValue(this.userEntityOptionsDropdownList[0].value);
        this.entityChoiceModal = this.modalService.open(this.chooseEntitiesForResponsePopupRef, {centered: true});
    }

    private submitResponse() {
        const responseData: FormResult = this.opfabAPIService.templateInterface.getUserResponse();

        if (responseData.valid) {
            const publisherEntity = responseData.publisher ?? this.userEntityIdToUseForResponse;

            if (!this.userEntitiesAllowedToRespond.includes(publisherEntity)) {
                logger.error("Response card publisher not allowed : " + publisherEntity);
                this.displayMessage(ResponseI18nKeys.SUBMIT_ERROR_MSG, null, MessageLevel.ERROR);
                return;
            }

            const entityRecipients = [...this.card.entityRecipients];
            this.addPublisherToEntityRecipientsIfNotAlreadyPresent(entityRecipients);

            const card: CardForPublishing = {
                publisher: publisherEntity,
                publisherType: 'ENTITY',
                processVersion: this.card.processVersion,
                process: this.card.process,
                processInstanceId: `${this.card.processInstanceId}_${publisherEntity}`,
                state: responseData.responseState ? responseData.responseState : this.cardState.response.state,
                startDate: this.card.startDate,
                endDate: this.card.endDate,
                expirationDate: this.card.expirationDate,
                severity: Severity.INFORMATION,
                entityRecipients: entityRecipients,
                userRecipients: this.card.userRecipients,
                groupRecipients: this.card.groupRecipients,
                externalRecipients: this.cardState.response.externalRecipients,
                title: this.card.title,
                summary: this.card.summary,
                data: responseData.responseCardData,
                parentCardId: this.card.id,
                initialParentCardUid: this.card.uid
            };
            this.sendingResponseInProgress = true;
            CardService.postCard(card).subscribe(
                (resp) => {
                    this.sendingResponseInProgress = false;
                    if (resp.status !== ServerResponseStatus.OK) {
                        this.displayMessage(ResponseI18nKeys.SUBMIT_ERROR_MSG, null, MessageLevel.ERROR);
                        console.error(resp);
                    } else {
                        this.isResponseLocked = true;
                        this.opfabAPIService.templateInterface.lockAnswer();
                        this.displayMessage(ResponseI18nKeys.SUBMIT_SUCCESS_MSG, null, MessageLevel.INFO);
                    }
                }
            );
        } else {
            responseData.errorMsg && responseData.errorMsg !== ''
                ? this.displayMessage(responseData.errorMsg, null, MessageLevel.ERROR)
                : this.displayMessage(ResponseI18nKeys.FORM_ERROR_MSG, null, MessageLevel.ERROR);
        }
    }

    private addPublisherToEntityRecipientsIfNotAlreadyPresent(entityRecipients: Array<string>) {
        if ((this.card.publisherType === 'ENTITY') && (!entityRecipients?.includes(this.card.publisher))) {
            entityRecipients.push(this.card.publisher);
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
