/* Copyright (c) 2022-2026, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Component, EventEmitter, Input, OnChanges, OnInit, Output, TemplateRef, ViewChild, inject} from '@angular/core';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NgbModal, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import {Card} from 'app/model/Card';
import {MessageLevel} from '@ofServices/alerteMessage/model/Message';
import {MultiSelectConfig} from 'app/components/share/multi-select/model/MultiSelect';
import {PermissionEnum} from '@ofServices/groups/model/PermissionEnum';
import {State} from '@ofServices/processes/model/Processes';
import {User} from '@ofServices/users/model/User';
import {EntitiesService} from '@ofServices/entities/EntitiesService';
import {ProcessesService} from '@ofServices/processes/ProcessesService';
import {UserPermissionsService} from '@ofServices/userPermissions/UserPermissionsService';
import {UsersService} from '@ofServices/users/UsersService';
import {Utilities} from '../../../../utils/Utilities';
import {AlertMessageService} from '@ofServices/alerteMessage/AlertMessageService';
import {LoggerService as logger} from 'app/services/logs/LoggerService';

import {TranslateModule} from '@ngx-translate/core';
import {MultiSelectComponent} from '../../../share/multi-select/MultiSelectComponent';
import {CardTemplateGateway} from '@ofServices/templateGateway/CardTemplateGateway';
import {CardResponseService} from '@ofServices/cardResponse/CardResponseService';
import {ModalService} from '@ofServices/modal/ModalService';
import {I18n} from '../../../../model/I18n';

const enum ResponseI18nKeys {
    FORM_ERROR_MSG = 'response.error.form',
    SUBMIT_ERROR_MSG = 'response.error.submit',
    SUBMIT_SUCCESS_MSG = 'response.submitSuccess'
}

@Component({
    selector: 'of-card-response',
    templateUrl: './CardResponseComponent.html',
    imports: [TranslateModule, FormsModule, ReactiveFormsModule, MultiSelectComponent]
})
export class CardResponseComponent implements OnChanges, OnInit {
    private readonly modalService = inject(NgbModal);

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

    public user: User;
    public multiSelectConfig: MultiSelectConfig = {
        labelKey: 'shared.entity',
        multiple: true,
        search: true
    };
    public btnValidateLabel = 'response.btnValidate';
    public btnUnlockLabel = 'response.btnUnlock';
    isReadOnlyUser: boolean;

    private askConfirmation: boolean;

    constructor() {
        const userWithPerimeters = UsersService.getCurrentUserWithPerimeters();
        if (userWithPerimeters) this.user = userWithPerimeters.userData;
    }

    ngOnInit() {
        const processDefinition = ProcessesService.getProcess(this.card.process);
        this.askConfirmation = processDefinition.states.get(this.card.state).response?.showConfirmationPopup ?? false;

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

    public async processClickOnSendResponse() {
        const userResponse = await CardTemplateGateway.getUserResponseFromTemplate(undefined);

        if (this.userEntitiesAllowedToRespond.length > 1 && !userResponse.responseCard.publisher)
            this.displayEntitiesChoicePopup();
        else await this.submitResponse(this.userEntitiesAllowedToRespond[0]);
    }

    private displayEntitiesChoicePopup() {
        this.selectEntitiesForm.get('entities').setValue(this.userEntityOptionsDropdownList[0].value);
        this.entityChoiceModal = this.modalService.open(this.chooseEntitiesForResponsePopupRef, {centered: true});
    }

    private async submitResponse(userEntityIdToUseForResponse: string) {
        const response = await CardTemplateGateway.getUserResponseFromTemplate(userEntityIdToUseForResponse);

        if (response.valid) {
            const publisherEntity = response.responseCard.publisher ?? userEntityIdToUseForResponse;
            response.responseCard.publisher = publisherEntity;
            this.sendingResponseInProgress = true;
            const currentCardId = this.card.id;
            CardResponseService.sendResponse(this.card, response.responseCard)
                .then(() => {
                    this.sendingResponseInProgress = false;
                    this.isResponseLocked = true;
                    //  we check if the current card is still the same as when we submitted the response
                    //  to avoid sending messages to the template if the user has navigated to another card in the meantime
                    if (currentCardId === CardTemplateGateway.getCard().id) {
                        CardTemplateGateway.sendResponseLockToTemplate();
                        CardTemplateGateway.sendResponseFromChildCardsSendingToTemplate({
                            publisher: publisherEntity,
                            error: false,
                            message: ''
                        });
                    }
                    this.displayMessage(ResponseI18nKeys.SUBMIT_SUCCESS_MSG, null, MessageLevel.INFO);
                })
                .catch((error) => {
                    this.sendingResponseInProgress = false;
                    logger.error(error);
                    //  we check if the current card is still the same as when we submitted the response
                    //  to avoid sending messages to the template if the user has navigated to another card in the meantime
                    if (currentCardId === CardTemplateGateway.getCard().id) {
                        CardTemplateGateway.sendResponseFromChildCardsSendingToTemplate({
                            publisher: publisherEntity,
                            error: true,
                            message: error.message
                        });
                    }
                    this.displayMessage(ResponseI18nKeys.SUBMIT_ERROR_MSG, null, MessageLevel.ERROR);
                });
        } else {
            response.errorMsg && response.errorMsg !== ''
                ? this.displayMessage(response.errorMsg, null, MessageLevel.ERROR)
                : this.displayMessage(ResponseI18nKeys.FORM_ERROR_MSG, null, MessageLevel.ERROR);
        }
    }

    private displayMessage(i18nKey: string, msg: string, severity: MessageLevel = MessageLevel.ERROR) {
        AlertMessageService.sendAlertMessage({message: msg, level: severity, i18n: {key: i18nKey}});
    }

    public async submitEntitiesChoice() {
        this.entityChoiceModal.dismiss();

        for (const selectedEntity of this.getSelectedEntities()) {
            await this.submitResponse(selectedEntity);
        }
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

    public openSendResponseConfirmationModal() {
        ModalService.openConfirmationModal(
            new I18n('shared.popup.title'),
            new I18n('shared.popup.areYouSureYouWantToSendResponse')
        ).then((confirm) => {
            if (confirm) {
                this.processClickOnSendResponse();
            }
        });
    }

    public openConfirmSendResponse() {
        if (this.askConfirmation) {
            this.openSendResponseConfirmationModal();
        } else {
            this.processClickOnSendResponse();
        }
    }
}
