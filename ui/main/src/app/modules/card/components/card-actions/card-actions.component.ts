/* Copyright (c) 2022-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {
    Component,
    EventEmitter,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    Output,
    TemplateRef,
    ViewChild
} from '@angular/core';
import {NgbModal, NgbModalOptions, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import {Card} from '@ofModel/card.model';
import {MessageLevel} from '@ofModel/message.model';
import {PermissionEnum} from '@ofServices/groups/model/PermissionEnum';
import {State} from '@ofServices/processes/model/Processes';
import {AlertMessageService} from 'app/business/services/alert-message.service';
import {UserPermissionsService} from 'app/business/services/user-permissions.service';
import {UserService} from 'app/business/services/users/user.service';
import {Subject} from 'rxjs';
import {CardService} from 'app/business/services/card/card.service';
import {ServerResponseStatus} from 'app/business/server/serverResponse';
import {PageType, RouterStore} from 'app/business/store/router.store';
import {Router} from '@angular/router';
import {LoggerService} from 'app/services/logs/LoggerService';
import {ModalService} from 'app/business/services/modal.service';
import {I18n} from '@ofModel/i18n.model';
import {NgIf} from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';
import {UserCardComponent} from '../../../usercard/usercard.component';
import {SpinnerComponent} from '../../../share/spinner/spinner.component';
import {EntitiesService} from '@ofServices/entities/EntitiesService';
import {CardTemplateGateway} from '@ofServices/templateGateway/CardTemplateGateway';

@Component({
    selector: 'of-card-actions',
    templateUrl: './card-actions.component.html',
    styleUrls: ['./card-actions.component.scss'],
    standalone: true,
    imports: [NgIf, TranslateModule, UserCardComponent, SpinnerComponent]
})
export class CardActionsComponent implements OnInit, OnChanges, OnDestroy {
    @Input() card: Card;
    @Input() cardState: State;
    @Input() parentModalRef: NgbModalRef;

    @Output() closeCardDetail: EventEmitter<boolean> = new EventEmitter<boolean>();

    @ViewChild('userCardEdition') userCardEditionTemplate: TemplateRef<any>;
    @ViewChild('userCardCreateCopy') userCardCreateCopyTemplate: TemplateRef<any>;
    @ViewChild('deleteCardConfirmation') deleteCardConfirmationTemplate: TemplateRef<any>;

    private editModal: NgbModalRef;
    public showEditButton = false;
    public showDeleteButton = false;
    public showCreateCopyButton = false;
    public deleteInProgress = false;

    private readonly unsubscribe$: Subject<void> = new Subject<void>();

    constructor(
        private readonly modalService: NgbModal,
        private readonly router: Router
    ) {}

    ngOnInit(): void {
        CardTemplateGateway.registerFunctionToEditCard(() => {
            if (this.doesTheUserHavePermissionToEditCard()) this.editCard();
        });
    }

    ngOnChanges(): void {
        this.setButtonsVisibility();
    }

    private setButtonsVisibility() {
        this.showEditButton =
            this.cardState.editCardEnabledOnUserInterface && this.doesTheUserHavePermissionToEditCard();

        this.showDeleteButton =
            this.cardState.deleteCardEnabledOnUserInterface && this.doesTheUserHavePermissionToDeleteCard();

        this.showCreateCopyButton =
            !UserService.hasCurrentUserAnyPermission([PermissionEnum.READONLY]) &&
            this.cardState.copyCardEnabledOnUserInterface &&
            this.cardState.userCard &&
            this.isUserMemberOfAnEntityAllowedToPublishForThisState() &&
            UserService.isWriteRightsForProcessAndState(this.card.process, this.card.state);
    }

    private isUserMemberOfAnEntityAllowedToPublishForThisState(): boolean {
        if (!this.cardState.userCard.publisherList) return true;
        const userEntities = UserService.getCurrentUserWithPerimeters().userData.entities;
        const allowedPublishers = EntitiesService.resolveEntities(this.cardState.userCard.publisherList);
        const userAllowedEntities = allowedPublishers.filter((publisher) => userEntities.includes(publisher.id));
        return userAllowedEntities.length > 0;
    }

    private doesTheUserHavePermissionToEditCard(): boolean {
        return UserPermissionsService.doesTheUserHavePermissionToEditCard(
            UserService.getCurrentUserWithPerimeters(),
            this.card
        );
    }

    private doesTheUserHavePermissionToDeleteCard(): boolean {
        return UserPermissionsService.doesTheUserHavePermissionToDeleteCard(
            UserService.getCurrentUserWithPerimeters(),
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
        if (
            RouterStore.getCurrentPageType() !== PageType.CALENDAR &&
            RouterStore.getCurrentPageType() !== PageType.MONITORING &&
            RouterStore.getCurrentPageType() !== PageType.DASHBOARD
        ) {
            this.editModal.result.then(
                () => {
                    // If modal is closed
                    this.router.navigate([RouterStore.getCurrentRoute(), 'cards', this.card.id]);
                },
                () => {
                    this.router.navigate([RouterStore.getCurrentRoute(), 'cards', this.card.id]);
                }
            );
        }
    }

    public openDeleteConfirmationModal() {
        ModalService.openConfirmationModal(
            new I18n('userCard.deleteCard.title'),
            new I18n('userCard.deleteCard.doYouReallyWant')
        ).then((confirm) => {
            if (confirm) {
                this.deleteCard();
            }
        });
    }

    public deleteCard(): void {
        this.deleteInProgress = true;
        CardService.deleteCard(this.card).subscribe((resp) => {
            const status = resp.status;
            if (status === ServerResponseStatus.OK) {
                this.closeDetails();
                this.displayMessage('userCard.deleteCard.cardDeletedWithNoError', null, MessageLevel.INFO);
            } else {
                LoggerService.error('Impossible to delete card , error status from service : ' + status);
                this.displayMessage('userCard.deleteCard.error.impossibleToDeleteCard ', null, MessageLevel.ERROR);
            }
            this.deleteInProgress = false;
        });
    }

    private displayMessage(i18nKey: string, msg: string, severity: MessageLevel = MessageLevel.ERROR) {
        AlertMessageService.sendAlertMessage({message: msg, level: severity, i18n: {key: i18nKey}});
    }

    ngOnDestroy() {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
