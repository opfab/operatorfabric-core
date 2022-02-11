/* Copyright (c) 2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Component, OnInit} from '@angular/core';
import {UserService} from '@ofServices/user.service';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {NgbModalRef} from '@ng-bootstrap/ng-bootstrap/modal/modal-ref';
import {UserWithPerimeters} from '@ofModel/userWithPerimeters.model';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {SettingsService} from '@ofServices/settings.service';
import {EntitiesService} from '@ofServices/entities.service';
import {CardService} from '@ofServices/card.service';
import {Utilities} from '../../common/utilities';


@Component({
    selector: 'of-activityarea',
    templateUrl: './activityarea.component.html',
    styleUrls: ['./activityarea.component.scss']
})

export class ActivityareaComponent implements OnInit {
    activityAreaForm: FormGroup;
    currentUserWithPerimeters: UserWithPerimeters;
    userEntities: {entityId: string, entityName: string, isDisconnected: boolean}[] = [];
    saveSettingsInProgress = false;
    messageAfterSavingSettings: string;
    displaySendResultError = false;

    modalRef: NgbModalRef;

    constructor(private formBuilder: FormBuilder,
                private userService: UserService,
                private entitiesService: EntitiesService,
                private modalService: NgbModal,
                private settingsService: SettingsService,
                private cardService: CardService) {}

    private initForm() {
        const group = {};
        this.userEntities.forEach(userEntity => {
            if (userEntity.isDisconnected)
                group[userEntity.entityId] = new FormControl('');
            else
                group[userEntity.entityId] = new FormControl('true');
        });
        this.activityAreaForm = new FormGroup(group);
    }

    ngOnInit() {
        this.userService.currentUserWithPerimeters().subscribe(result => {
            this.currentUserWithPerimeters = result;

            // we retrieve all the entities to which the user can connect
            this.userService.getUser(this.currentUserWithPerimeters.userData.login).subscribe(currentUser => {

                const entities = this.entitiesService.getEntitiesFromIds(currentUser.entities);
                entities.forEach(entity => {
                    if (entity.entityAllowedToSendCard) { // this avoids to display entities used only for grouping
                        const isDisconnected = !this.currentUserWithPerimeters.userData.entities.includes(entity.id);
                        this.userEntities.push(
                            {
                                entityId: entity.id,
                                entityName: entity.name,
                                isDisconnected: isDisconnected
                            });
                    }
                });
                this.userEntities.sort((a, b) => Utilities.compareObj(a.entityName, b.entityName));
                this.initForm();
            });
        });
    }

    confirmSaveSettings() {

        if (this.saveSettingsInProgress) return; // avoid multiple clicks
        this.saveSettingsInProgress = true;
        const disconnectedEntities = [];

        for (const entityId of Object.keys(this.activityAreaForm.controls)) {
            const control = this.activityAreaForm.get(entityId); // 'control' is a FormControl
            if (! control.value) // not checked
                disconnectedEntities.push(entityId);
        }

        this.settingsService.patchUserSettings({login: this.currentUserWithPerimeters.userData.login,
            entitiesDisconnected: disconnectedEntities})
            .subscribe({
                next: resp => {
                    this.saveSettingsInProgress = false;
                    this.messageAfterSavingSettings = '';
                    const msg = resp.message;
                    if (!!msg && msg.includes('unable')) {
                        console.log('Impossible to save settings, error message from service : ', msg);
                        this.messageAfterSavingSettings = 'shared.error.impossibleToSaveSettings';
                        this.displaySendResultError = true;
                    } else {
                        this.cardService.removeAllLightCardFromMemory();
                    }
                    this.modalRef.close();
                },
                error: err => {
                    console.error('Error when saving settings :', err);
                    this.modalRef.close();
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
        if (!this.saveSettingsInProgress)
            this.modalRef.close();
    }

    openConfirmSaveSettingsModal(content) {
        this.modalRef = this.modalService.open(content, {centered: true, backdrop: 'static'});
    }
}
