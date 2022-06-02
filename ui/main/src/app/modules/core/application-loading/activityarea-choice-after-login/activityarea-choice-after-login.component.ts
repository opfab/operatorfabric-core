/* Copyright (c) 2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Component, TemplateRef, ViewChild} from '@angular/core';
import {NgbModal, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import {ConfigService} from '@ofServices/config.service';
import {EntitiesService} from '@ofServices/entities.service';
import {UserService} from '@ofServices/user.service';
import {ApplicationLoadingStep} from '../application-loading-step';

@Component({
    selector: 'of-activityarea-choice-after-login',
    templateUrl: './activityarea-choice-after-login.component.html'
})
export class ActivityAreaChoiceAfterLoginComponent extends ApplicationLoadingStep {
    private modalRef: NgbModalRef;
    @ViewChild('activityArea') activityAreaPopupRef: TemplateRef<any>;

    constructor(
        private userService: UserService,
        private entitiesService: EntitiesService,
        private modalService: NgbModal,
        private configService: ConfigService
    ) {
        super();
    }

    public execute(): void {
        if (this.configService.getConfigValue('selectActivityAreaOnLogin', false)) this.confirmActivityArea();
        else this.sendActivityAreaChoiceDone();
    }

    private confirmActivityArea() {
        const login = this.userService.getCurrentUserWithPerimeters().userData.login;
        this.userService.getUser(login).subscribe((currentUser) => {
            const entities = this.entitiesService.getEntitiesFromIds(currentUser.entities);
            if (entities.filter((entity) => entity.entityAllowedToSendCard).length > 1)
                this.modalRef = this.modalService.open(this.activityAreaPopupRef, {
                    centered: true,
                    backdrop: 'static',
                    size: 'xl'
                });
            else this.sendActivityAreaChoiceDone();
        });
    }

    onActivityAreaConfirm() {
        this.modalRef.close();
        this.sendActivityAreaChoiceDone();
    }

    sendActivityAreaChoiceDone() {
        this.setStepAsFinishedWithoutError();
    }
}
