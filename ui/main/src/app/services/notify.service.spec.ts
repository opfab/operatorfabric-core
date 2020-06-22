/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


import { NotifyService } from './notify.service';
import { TestBed } from '@angular/core/testing';

describe('NotifyService', () => {

    let mockWindow: any;
    let mockNotification: any;
    let notifyService: any;
    beforeEach(() => {

        mockNotification = function (title, options) {
            this.title = title;
            this.options = options;
            this.requestPermission = jasmine.createSpy();
        };
        TestBed.configureTestingModule({
            providers: [NotifyService]
        });
        mockWindow = {
            Notification: new mockNotification('test', {}),
            document: {hidden: true}
        };
        notifyService = TestBed.get(NotifyService);
    });
    it('should check if notification are supported', () => {
        expect(notifyService.isSupported(mockWindow)).toBeTruthy();
    });

});
