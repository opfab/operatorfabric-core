/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


import {Observable, of} from "rxjs";
import {Menu, MenuEntry, MenuEntryLinkTypeEnum} from "@ofModel/processes.model";

export class ProcessesServiceMock {
    computeBusinessconfigMenu(): Observable<Menu[]>{
        return of([new Menu('t1', '1', 'tLabel1', [
            new MenuEntry('id1', 'label1', 'link1', MenuEntryLinkTypeEnum.BOTH),
            new MenuEntry('id2', 'label2', 'link2', MenuEntryLinkTypeEnum.BOTH),
        ]),
            new Menu('t2', '1', 'tLabel2', [
                new MenuEntry('id3', 'label3', 'link3', MenuEntryLinkTypeEnum.BOTH),
            ])])
    }
    loadI18nForMenuEntries(){return of(true)}
}
