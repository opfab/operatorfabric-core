/* Copyright (c) 2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

export class NearestDomainId {
    private domainOrderedList: Array<any>;

    private static readonly MS_PER_HOUR = 1000 * 60 * 60;
    private static readonly MS_PER_DAY = NearestDomainId.MS_PER_HOUR * 24;
    private static readonly MS_PER_MONTH = NearestDomainId.MS_PER_DAY * 30;

    public setDomainList(domainList: Array<string>): void {
        this.domainOrderedList = [
            {id: 'RT', threshold: NearestDomainId.MS_PER_HOUR * 12},
            {id: 'D', threshold: NearestDomainId.MS_PER_HOUR * 36},
            {id: '7D', threshold: NearestDomainId.MS_PER_DAY * 10},
            {id: 'W', threshold: NearestDomainId.MS_PER_DAY * 10},
            {id: 'M', threshold: NearestDomainId.MS_PER_MONTH * 3},
            {id: 'Y', threshold: undefined}
        ].filter((domain) => domainList.includes(domain.id));
    }

    public getNearestDomainId(startDate: number, endDate: number): string {
        const period = endDate - startDate;
        if (this.domainOrderedList.length === 1) {
            return this.domainOrderedList[0].id;
        }
        for (const domain of this.domainOrderedList) {
            if (period <= domain.threshold) return domain.id;
        }

        return this.domainOrderedList[this.domainOrderedList.length - 1].id;
    }
}
