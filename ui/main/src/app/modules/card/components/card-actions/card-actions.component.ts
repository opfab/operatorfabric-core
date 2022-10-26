/* Copyright (c) 2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Component, EventEmitter, Input, OnChanges, Output, TemplateRef, ViewChild} from '@angular/core';
import {NgbModal, NgbModalOptions, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import {Store} from '@ngrx/store';
import {Card} from '@ofModel/card.model';
import {MessageLevel} from '@ofModel/message.model';
import {State} from '@ofModel/processes.model';
import {AppService, PageType} from '@ofServices/app.service';
import {CardService} from '@ofServices/card.service';
import {UserPermissionsService} from '@ofServices/user-permissions.service';
import {UserService} from '@ofServices/user.service';
import {AlertMessageAction} from '@ofStore/actions/alert.actions';
import {AppState} from '@ofStore/index';

@Component({
    selector: 'of-card-actions',
    templateUrl: './card-actions.component.html',
    styleUrls: ['./card-actions.component.scss']
})
export class CardActionsComponent implements OnChanges {
    @Input() card: Card;
    @Input() cardState: State;
    @Input() parentModalRef: NgbModalRef;
    @Input() currentPath: string;

    @Output() closeCardDetail: EventEmitter<boolean> = new EventEmitter<boolean>();

    @ViewChild('userCardEdition') userCardEditionTemplate: TemplateRef<any>;
    @ViewChild('deleteCardConfirmation') deleteCardConfirmationTemplate: TemplateRef<any>;

    private editModal: NgbModalRef;
    private deleteConfirmationModal: NgbModalRef;
    public showEditButton = false;
    public showDeleteButton = false;
    public deleteInProgress = false;

    constructor(
        private userPermissionsService: UserPermissionsService,
        private userService: UserService,
        private modalService: NgbModal,
        private _appService: AppService,
        private cardService: CardService,
        private store: Store<AppState>
    ) {}

    ngOnChanges(): void {
        this.setButtonsVisibility();
    }

    private setButtonsVisibility() {
        this.showEditButton =
            this.cardState.editCardEnabledOnUserInterface && this.doesTheUserHavePermissionToEditCard();
        this.showDeleteButton =
            this.cardState.deleteCardEnabledOnUserInterface && this.doesTheUserHavePermissionToDeleteCard();
    }

    private doesTheUserHavePermissionToEditCard(): boolean {
        return this.userPermissionsService.doesTheUserHavePermissionToEditCard(
            this.userService.getCurrentUserWithPerimeters(),
            this.card
        );
    }

    private doesTheUserHavePermissionToDeleteCard(): boolean {
        return this.userPermissionsService.doesTheUserHavePermissionToDeleteCard(
            this.userService.getCurrentUserWithPerimeters(),
            this.card
        );
    }

    public editCard(): void {
        // We close the card detail in the background to avoid interference when executing the template for the edition preview.
        // Otherwise, this can cause issues with templates functions referencing elements by id as there are two elements with the same id
        // in the document.
        this.closeDetails();
        if (!!this.parentModalRef) this.parentModalRef.close();

        const options: NgbModalOptions = {
            size: 'usercard',
            backdrop: 'static'
        };
        this.editModal = this.modalService.open(this.userCardEditionTemplate, options);
        this.reopenCardDetailOnceEditionIsFinished();
    }

    public closeDetails() {
        this.closeCardDetail.emit(true);
    }

    private reopenCardDetailOnceEditionIsFinished() {
        if (this._appService.pageType !== PageType.CALENDAR && this._appService.pageType !== PageType.MONITORING) {
            this.editModal.result.then(
                () => {
                    // If modal is closed
                    this._appService.reopenDetails(this.currentPath, this.card.id);
                },
                () => {
                    this._appService.reopenDetails(this.currentPath, this.card.id);
                }
            );
        }
    }

    public openDeleteConfirmationModal() {
        const modalOptions = {centered: true};
        this.deleteConfirmationModal = this.modalService.open(this.deleteCardConfirmationTemplate, modalOptions);
    }

    public declineDeleteCard(): void {
        this.deleteConfirmationModal.dismiss();
    }

    public confirmDeleteCard(): void {
        this.deleteInProgress = true;
        if (!!this.deleteConfirmationModal) this.deleteConfirmationModal.close();
        this.cardService.deleteCard(this.card).subscribe({
            next: (resp) => {
                const status = resp.status;
                if (status === 200) {
                    this.closeDetails();
                    this.displayMessage('userCard.deleteCard.cardDeletedWithNoError', null, MessageLevel.INFO);
                } else {
                    console.log('Impossible to delete card , error status from service : ', status);
                    this.displayMessage('userCard.deleteCard.error.impossibleToDeleteCard ', null, MessageLevel.ERROR);
                }
                this.deleteInProgress = false;
            },
            error: (err) => {
                console.error('Error when deleting card :', err);
                this.displayMessage('userCard.deleteCard.error.impossibleToDeleteCard ', null, MessageLevel.ERROR);
                this.deleteInProgress = false;
            }
        });
    }

    private displayMessage(i18nKey: string, msg: string, severity: MessageLevel = MessageLevel.ERROR) {
        this.store.dispatch(
            new AlertMessageAction({alertMessage: {message: msg, level: severity, i18n: {key: i18nKey}}})
        );
    }
}
