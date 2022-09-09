/* Copyright (c) 2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {UserService} from '@ofServices/user.service';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {NgbModalRef} from '@ng-bootstrap/ng-bootstrap/modal/modal-ref';
import {UserWithPerimeters} from '@ofModel/userWithPerimeters.model';
import {FormControl, FormGroup} from '@angular/forms';
import {SettingsService} from '@ofServices/settings.service';
import {EntitiesService} from '@ofServices/entities.service';
import {CardService} from '@ofServices/card.service';
import {Utilities} from '../../common/utilities';
import {GroupsService} from '@ofServices/groups.service';
import {Actions, ofType} from '@ngrx/effects';
import {UserActionsTypes} from '@ofStore/actions/user.actions';

@Component({
    selector: 'of-activityarea',
    templateUrl: './activityarea.component.html',
    styleUrls: ['./activityarea.component.scss']
})
export class ActivityareaComponent implements OnInit, OnDestroy {
    @Input() titleI18nKey = 'activityArea.title';
    @Input() askConfirmation = true;
    @Output() confirm = new EventEmitter();

    activityAreaForm: FormGroup<{}>;
    currentUserWithPerimeters: UserWithPerimeters;
    userEntities: {entityId: string; entityName: string; isDisconnected: boolean}[] = [];
    saveSettingsInProgress = false;
    messageAfterSavingSettings: string;
    displaySendResultError = false;
    isScreenLoaded = false;

    connectedUsersPerEntityAndGroup: Map<string, Set<string>> = new Map<string, Set<string>>(); // We use a Set because we don't want duplicates
    userRealtimeGroupsIds: string[] = [];
    interval;

    modalRef: NgbModalRef;

    constructor(
        private userService: UserService,
        private entitiesService: EntitiesService,
        private groupsService: GroupsService,
        private modalService: NgbModal,
        private settingsService: SettingsService,
        private cardService: CardService,
        private actions$: Actions
    ) {}

    private initForm() {
        const group = {};
        this.userEntities.forEach((userEntity) => {
            if (userEntity.isDisconnected) {
                group[userEntity.entityId] = new FormControl<boolean | null>(false);
            } else {
                group[userEntity.entityId] = new FormControl<boolean | null>(true);
            }
        });
        this.activityAreaForm = new FormGroup(group);
    }

    ngOnInit() {
       this.loadUserData();

       this.actions$.pipe(
        ofType(UserActionsTypes.UserConfigLoaded)
        ).subscribe(() => this.loadUserData());

        this.interval = setInterval(() => {
            this.refresh();
        }, 2000);
    }

    loadUserData() {
        this.userEntities = [];
        this.currentUserWithPerimeters = this.userService.getCurrentUserWithPerimeters();

        // we retrieve all the entities to which the user can connect
        this.userService.getUser(this.currentUserWithPerimeters.userData.login).subscribe((currentUser) => {
            this.isScreenLoaded = true;
            const entities = this.entitiesService.getEntitiesFromIds(currentUser.entities);
            entities.forEach((entity) => {
                if (entity.entityAllowedToSendCard) {
                    // this avoids to display entities used only for grouping
                    const isDisconnected =
                        this.activityAreaForm && this.activityAreaForm.get(entity.id)
                            ? !this.activityAreaForm.get(entity.id).value // Keep form value if esists
                            : !this.currentUserWithPerimeters.userData.entities.includes(entity.id);

                    this.userEntities.push({
                        entityId: entity.id,
                        entityName: entity.name,
                        isDisconnected: isDisconnected
                    });
                }
            });
            this.userEntities.sort((a, b) => Utilities.compareObj(a.entityName, b.entityName));
            this.initForm();

            if (!!this.currentUserWithPerimeters.userData.groups)
                this.userRealtimeGroupsIds = this.currentUserWithPerimeters.userData.groups.filter((groupId) =>
                    this.groupsService.isRealtimeGroup(groupId)
                );

            this.refresh();
        });
    }

    refresh() {
        this.userService.loadConnectedUsers().subscribe((connectedUsers) => {
            this.connectedUsersPerEntityAndGroup.clear();

            connectedUsers.sort((obj1, obj2) => Utilities.compareObj(obj1.login, obj2.login));

            connectedUsers.forEach((connectedUser) => {
                if ((connectedUser.login !== this.currentUserWithPerimeters.userData.login) && (!! connectedUser.entitiesConnected)) {
                    connectedUser.entitiesConnected.forEach((entityConnectedId) => {
                        if (this.userEntities.map((userEntity) => userEntity.entityId).includes(entityConnectedId)) {
                            connectedUser.groups.forEach((groupId) => {
                                if (
                                    this.groupsService.isRealtimeGroup(groupId) &&
                                    this.currentUserWithPerimeters.userData.groups.includes(groupId)
                                )
                                    this.addUserToConnectedUsersPerEntityAndGroup(
                                        connectedUser.login,
                                        entityConnectedId,
                                        groupId
                                    );
                            });
                        }
                    });
                }
            });
        });
    }

    private addUserToConnectedUsersPerEntityAndGroup(login: string, entityId: string, groupId: string) {
        let usersConnectedPerEntityAndGroup = this.connectedUsersPerEntityAndGroup.get(entityId + '.' + groupId);

        if (!usersConnectedPerEntityAndGroup) usersConnectedPerEntityAndGroup = new Set();

        usersConnectedPerEntityAndGroup.add(login);
        this.connectedUsersPerEntityAndGroup.set(entityId + '.' + groupId, usersConnectedPerEntityAndGroup);
    }

    getNumberOfConnectedUsersInEntityAndGroup(entityAndGroup: string): number {
        const connectedUsers = this.connectedUsersPerEntityAndGroup.get(entityAndGroup);
        if (!!connectedUsers) return connectedUsers.size;
        return 0;
    }

    labelForConnectedUsers(entityAndGroup: string): string {
        let label = '';
        const connectedUsers = this.connectedUsersPerEntityAndGroup.get(entityAndGroup);

        if (!!connectedUsers)
            label =
                connectedUsers.size > 1
                    ? connectedUsers.values().next().value + ', ...'
                    : connectedUsers.values().next().value;

        return label;
    }

    confirmSaveSettings() {
        if (this.saveSettingsInProgress) return; // avoid multiple clicks
        this.saveSettingsInProgress = true;

        if (!!this.modalRef) this.modalRef.close(); // we close the confirmation popup

        const disconnectedEntities = [];

        for (const entityId of Object.keys(this.activityAreaForm.controls)) {
            const control = this.activityAreaForm.get(entityId); // 'control' is a FormControl
            if (!control.value)
                // not checked
                disconnectedEntities.push(entityId);
        }
        console.log(new Date().toISOString() + 'Patch entities disconnected = ' + disconnectedEntities);
        this.settingsService
            .patchUserSettings({
                login: this.currentUserWithPerimeters.userData.login,
                entitiesDisconnected: disconnectedEntities
            })
            .subscribe({
                next: (resp) => {
                    this.saveSettingsInProgress = false;
                    this.messageAfterSavingSettings = '';
                    const msg = resp.message;
                    if (!!msg && msg.includes('unable')) {
                        console.log('Impossible to save settings, error message from service : ', msg);
                        this.messageAfterSavingSettings = 'shared.error.impossibleToSaveSettings';
                        this.displaySendResultError = true;
                    } else {
                        this.cardService.removeAllLightCardFromMemory();
                        this.userService.loadUserWithPerimetersData().subscribe();
                    }
                    if (!!this.modalRef) this.modalRef.close();
                    this.confirm.emit();
                },
                error: (err) => {
                    this.saveSettingsInProgress = false;
                    console.error('Error when saving settings :', err);
                    if (!!this.modalRef) this.modalRef.close();
                    this.messageAfterSavingSettings = 'shared.error.impossibleToSaveSettings';
                    this.displaySendResultError = true;
                }
            });
    }

    doNotConfirmSaveSettings() {
        // The modal must not be closed until the settings has been saved in the back
        // If not, with slow network, when user goes to the feed before the end of the request
        // it ends up with nothing in the feed
        // This happens because method this.cardService.removeAllLightCardFromMemory()
        // is called too late (in method confirmSaveSettings)
        if (!this.saveSettingsInProgress) this.modalRef.close();
    }

    openConfirmSaveSettingsModal(content) {
        if (this.askConfirmation) this.modalRef = this.modalService.open(content, {centered: true, backdrop: 'static'});
        else this.confirmSaveSettings();
    }

    ngOnDestroy() {
        clearInterval(this.interval);
    }
}
