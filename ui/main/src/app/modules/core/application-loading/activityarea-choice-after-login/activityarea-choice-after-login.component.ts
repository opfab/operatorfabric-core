/* Copyright (c) 2022-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Component, TemplateRef, ViewChild} from '@angular/core';
import {NgbModal, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import {RoleEnum} from '@ofServices/entities/model/RoleEnum';
import {ConfigService} from 'app/services/config/ConfigService';
import {EntitiesService} from '@ofServices/entities/EntitiesService';
import {UserService} from 'app/business/services/users/user.service';
import {ApplicationLoadingComponent} from '../../../../business/application-loading-component';
import {ActivityareaComponent} from '../../../activityarea/activityarea.component';

@Component({
    selector: 'of-activityarea-choice-after-login',
    templateUrl: './activityarea-choice-after-login.component.html',
    standalone: true,
    imports: [ActivityareaComponent]
})
export class ActivityAreaChoiceAfterLoginComponent extends ApplicationLoadingComponent {
    private modalRef: NgbModalRef;
    @ViewChild('activityArea') activityAreaPopupRef: TemplateRef<any>;

    constructor(private readonly modalService: NgbModal) {
        super();
    }

    public execute(): Promise<boolean> {
        if (ConfigService.getConfigValue('selectActivityAreaOnLogin', false)) this.confirmActivityArea();
        else {
            return Promise.resolve(true);
        }
        return super.execute();
    }

    private confirmActivityArea() {
        const login = UserService.getCurrentUserWithPerimeters().userData.login;
        UserService.getUser(login).subscribe((currentUser) => {
            const entities = EntitiesService.getEntitiesFromIds(currentUser.entities);
            if (entities.filter((entity) => entity.roles?.includes(RoleEnum.ACTIVITY_AREA)).length > 1)
                this.modalRef = this.modalService.open(this.activityAreaPopupRef, {
                    centered: true,
                    backdrop: 'static',
                    size: 'xl'
                });
            else this.setAsFinishedWithoutError();
        });
    }

    onActivityAreaConfirm() {
        this.modalRef.close();
        this.setAsFinishedWithoutError();
    }
}
