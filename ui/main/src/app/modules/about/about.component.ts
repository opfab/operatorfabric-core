/* Copyright (c) 2018-2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


import {Component, OnInit} from '@angular/core';
import _ from 'lodash-es';
import {ConfigService} from '@ofServices/config.service';
import packageInfo from '../../../../package.json';


/**
 * extracts configured application names along with their version, and sort them using their rank if declared
 *
 * @param applicationReferences: values declare in the 'web-ui.yml'. Each should contain at least
 * an application name and a version. Rank(optional) is used to order the list. The edge cases are tested in the
 * associated spec. Not that OperatorFabric come with the rank 0.
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

    aboutElements = [];

    constructor(private  configService: ConfigService) {
    }

    ngOnInit(): void {
        const aboutConfig = this.configService.getConfigValue('settings.about');
        this.aboutElements.push({name: 'OperatorFabric',
                                 rank: '0',
                                 version: packageInfo.version});
        if (aboutConfig)
            this.aboutElements = this.aboutElements.concat(extractNameWithVersionAndSortByRank(aboutConfig));
    }


}




