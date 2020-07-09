/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


import {Component, OnInit} from '@angular/core';
import _ from 'lodash';
import {ConfigService} from "@ofServices/config.service";

/**
 * extracts configured application names along with their version, and sort them using their rank if declared
 *
 * @param applicationReferences: values declare in the 'web-ui.yml'. Each should contains at least
 * an application name and a version. Rank(optional) is used to order the list. The edge cases are tested in the
 * associated spec. Not that OperatoFabric come with the rank 0.
 *@returns the values sorted by rank
 * */
export function extractNameWithVersionAndSortByRank(applicationReferences) {
    return _.sortBy(_.values(applicationReferences), ['rank'], ['asc']);
}

@Component({
    selector: 'of-about',
    styleUrls: ['./about.component.scss'],
    templateUrl: './about.component.html'
})
export class AboutComponent implements OnInit {

    aboutElements : any;

    constructor(private  configService: ConfigService) {
    }

    ngOnInit(): void {
        let aboutConfig = this.configService.getConfigValue('settings.about');
        if (aboutConfig) this.aboutElements = extractNameWithVersionAndSortByRank(aboutConfig);
    }


}
