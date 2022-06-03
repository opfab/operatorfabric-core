/* Copyright (c) 2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {NgbModal, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import {LogOption, OpfabLoggerService} from '@ofServices/logs/opfab-logger.service';
import {SoundNotificationService} from '@ofServices/sound-notification.service';

// Due to auto-policy in chromium based browsers, if the user does not interact with the application
// sound is not activated. This component open a modal and by clicking OK the user interacts with the application
// and activate the sound
//
// See https://developer.chrome.com/blog/autoplay/#web-audio
//

@Component({
    selector: 'of-sound-activation',
    templateUrl: './sound-activation.component.html'
})
export class SoundActivationComponent implements OnInit {
    
    @ViewChild('noSound') noSoundPopupRef: TemplateRef<any>;
    private modalRef: NgbModalRef;

    constructor(
        private soundNotificationService: SoundNotificationService,
        private logger: OpfabLoggerService,
        private modalService: NgbModal
    ) {}

    ngOnInit(): void {
        this.activateSoundIfNotActivated();
    }

    private activateSoundIfNotActivated() {
        setTimeout(() => {
            let playSoundOnExternalDevice = this.soundNotificationService.getPlaySoundOnExternalDevice();
            if (
                this.isNavigatorChromiumBased() &&
                !playSoundOnExternalDevice &&
                this.soundNotificationService.isAtLeastOneSoundActivated()
            ) {
                const context = new AudioContext();
                if (context.state !== 'running') {
                    context.resume();
                    this.logger.info('Sound not activated', LogOption.REMOTE);
                    this.modalRef = this.modalService.open(this.noSoundPopupRef, {
                        centered: true,
                        backdrop: 'static'
                    });
                }
            }
        }, 3000);
    }

    private isNavigatorChromiumBased() {
        return navigator.userAgent.indexOf('Chrom') > -1;
    }

    public closeModal() {
        this.logger.info('Sound activated', LogOption.REMOTE);
        this.modalRef.close();
    }
}
