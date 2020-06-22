/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


import {Observable, of} from "rxjs";
import {ThirdMenu, ThirdMenuEntry} from "@ofModel/thirds.model";

export class ThirdsServiceMock {
    computeThirdsMenu(): Observable<ThirdMenu[]>{
        return of([new ThirdMenu('t1', '1', 'tLabel1', [
            new ThirdMenuEntry('id1', 'label1', 'link1'),
            new ThirdMenuEntry('id2', 'label2', 'link2'),
        ]),
            new ThirdMenu('t2', '1', 'tLabel2', [
                new ThirdMenuEntry('id3', 'label3', 'link3'),
            ])])
    }
    loadI18nForMenuEntries(){return of(true)}
}
