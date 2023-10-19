/* Copyright (c) 2022-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Component, TemplateRef, ViewChild} from '@angular/core';
import {NgbModal, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import {ConfigService} from 'app/business/services/config.service';
import {EntitiesService} from 'app/business/services/users/entities.service';
import {UserService} from 'app/business/services/users/user.service';
import {ApplicationLoadingStep} from '../application-loading-step';

@Component({
    selector: 'of-activityarea-choice-after-login',
    templateUrl: './activityarea-choice-after-login.component.html'
})
export class ActivityAreaChoiceAfterLoginComponent extends ApplicationLoadingStep {
    private modalRef: NgbModalRef;
    @ViewChild('activityArea') activityAreaPopupRef: TemplateRef<any>;

    constructor(
        private entitiesService: EntitiesService,
        private modalService: NgbModal,
    ) {
        super();
    }

    public execute(): void {
        if (ConfigService.getConfigValue('selectActivityAreaOnLogin', false)) this.confirmActivityArea();
        else this.sendActivityAreaChoiceDone();
    }

    private confirmActivityArea() {
        const login = UserService.getCurrentUserWithPerimeters().userData.login;
        UserService.getUser(login).subscribe((currentUser) => {
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
