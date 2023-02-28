/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Component, ViewChild} from "@angular/core";
import {UserService} from "app/business/services/user.service";


declare const opfab: any;

@Component({
  selector: 'of-web-component',
  templateUrl: './webcomponent.component.html',
})
export class WebcomponentComponent {

  @ViewChild('userDetails') userDetails;

  constructor(userService: UserService) {
    const userData = userService.getCurrentUserWithPerimeters().userData;
    opfab.webComponent.setUsetDetails(userData);
  }

}


