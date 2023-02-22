/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */
import {ConfigService} from 'app/business/services/config.service';
import _ from 'lodash-es';
import packageInfo from '../../../../../../package.json';

export class AboutView {


    aboutElements = [];

    constructor(private configService: ConfigService) {
        const aboutConfig = this.configService.getConfigValue('about');
        this.aboutElements.push({name: 'OperatorFabric', rank: 0, version: packageInfo.opfabVersion});
        if (aboutConfig)
            this.aboutElements = this.aboutElements.concat(this.extractNameWithVersionAndSortByRank(aboutConfig));
    }

    /**
     * extracts configured application names along with their version, and sort them using their rank if declared
     *
     * @param applicationReferences: values declare in the 'web-ui.yml'. Each should contain at least
     * an application name and a version. Rank(optional) is used to order the list. The edge cases are tested in the
     * associated spec. Not that OperatorFabric come with the rank 0.
     *@returns the values sorted by rank
     * */
    extractNameWithVersionAndSortByRank(applicationReferences) {
        return _.sortBy(_.values(applicationReferences), ['rank'], ['asc']);
    }

    public getAboutElements() {
        return this.aboutElements;
    }
}
