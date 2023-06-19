/* Copyright (c) 2022-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Component, EventEmitter, Input, OnChanges, OnDestroy, Output, TemplateRef, ViewChild} from '@angular/core';
import {NgbModal, NgbModalOptions, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import {Card} from '@ofModel/card.model';
import {MessageLevel} from '@ofModel/message.model';
import {PermissionEnum} from '@ofModel/permission.model';
import {State} from '@ofModel/processes.model';
import {AlertMessageService} from 'app/business/services/alert-message.service';
import {UserPermissionsService} from 'app/business/services/user-permissions.service';
import {UserService} from 'app/business/services/user.service';
import {Subject} from 'rxjs';
import {CardService} from 'app/business/services/card/card.service';
import {ServerResponseStatus} from 'app/business/server/serverResponse';
import {PageType, RouterStore} from 'app/business/store/router.store';
import {Router} from '@angular/router';

@Component({
    selector: 'of-card-actions',
    templateUrl: './card-actions.component.html',
    styleUrls: ['./card-actions.component.scss']
})
export class CardActionsComponent implements OnChanges, OnDestroy {
    @Input() card: Card;
    @Input() cardState: State;
    @Input() parentModalRef: NgbModalRef;

    @Output() closeCardDetail: EventEmitter<boolean> = new EventEmitter<boolean>();

    @ViewChild('userCardEdition') userCardEditionTemplate: TemplateRef<any>;
    @ViewChild('userCardCreateCopy') userCardCreateCopyTemplate: TemplateRef<any>;
    @ViewChild('deleteCardConfirmation') deleteCardConfirmationTemplate: TemplateRef<any>;

    private editModal: NgbModalRef;
    private deleteConfirmationModal: NgbModalRef;
    public showEditButton = false;
    public showDeleteButton = false;
    public showCreateCopyButton = false;
    public deleteInProgress = false;

    private unsubscribe$: Subject<void> = new Subject<void>();
    isReadOnlyUser: boolean;

    constructor(
        private userPermissionsService: UserPermissionsService,
        private userService: UserService,
        private modalService: NgbModal,
        private cardService: CardService,
        private alertMessageService: AlertMessageService,
        private router: Router,
        private routerStore: RouterStore
    ) {}

    ngOnChanges(): void {
        this.setButtonsVisibility();
        this.isReadOnlyUser = this.userService.hasCurrentUserAnyPermission([PermissionEnum.READONLY]);
    }

    private setButtonsVisibility() {
        this.showEditButton =
            !this.isReadOnlyUser &&
            this.cardState.editCardEnabledOnUserInterface &&
            this.doesTheUserHavePermissionToEditCard();

        this.showDeleteButton =
            !this.isReadOnlyUser &&
            this.cardState.deleteCardEnabledOnUserInterface &&
            this.doesTheUserHavePermissionToDeleteCard();

        this.showCreateCopyButton =
            this.cardState.copyCardEnabledOnUserInterface &&
            this.cardState.userCard &&
            this.userService.isWriteRightsForProcessAndState(this.card.process, this.card.state);
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
        if (this.parentModalRef) this.parentModalRef.close();

        const options: NgbModalOptions = {
            size: 'usercard',
            backdrop: 'static'
        };
        this.editModal = this.modalService.open(this.userCardEditionTemplate, options);
        this.reopenCardDetailOnceEditionIsFinished();
    }

    public createCopy(): void {
        this.closeDetails();
        if (this.parentModalRef) this.parentModalRef.close();

        const options: NgbModalOptions = {
            size: 'usercard',
            backdrop: 'static'
        };
        this.editModal = this.modalService.open(this.userCardCreateCopyTemplate, options);
        this.reopenCardDetailOnceEditionIsFinished();
    }

    public closeDetails() {
        this.closeCardDetail.emit(true);
    }

    private reopenCardDetailOnceEditionIsFinished() {
        if (this.routerStore.getCurrentPageType() !== PageType.CALENDAR &&
            this.routerStore.getCurrentPageType() !== PageType.MONITORING &&
            this.routerStore.getCurrentPageType() !== PageType.DASHBOARD) {
            this.editModal.result.then(
                () => {
                     // If modal is closed
                    this.router.navigate([this.routerStore.getCurrentRoute(), 'cards', this.card.id]);
                },
                () => {
                    this.router.navigate([this.routerStore.getCurrentRoute(), 'cards', this.card.id]);
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
        if (this.deleteConfirmationModal) this.deleteConfirmationModal.close();
        this.cardService.deleteCard(this.card).subscribe((resp) => {
            const status = resp.status;
            if (status === ServerResponseStatus.OK) {
                this.closeDetails();
                this.displayMessage('userCard.deleteCard.cardDeletedWithNoError', null, MessageLevel.INFO);
            } else {
                console.log('Impossible to delete card , error status from service : ', status);
                this.displayMessage('userCard.deleteCard.error.impossibleToDeleteCard ', null, MessageLevel.ERROR);
            }
            this.deleteInProgress = false;
        });
    }

    private displayMessage(i18nKey: string, msg: string, severity: MessageLevel = MessageLevel.ERROR) {
        this.alertMessageService.sendAlertMessage({message: msg, level: severity, i18n: {key: i18nKey}});
    }

    ngOnDestroy() {
        if (this.deleteConfirmationModal)
            this.deleteConfirmationModal.dismiss();
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
