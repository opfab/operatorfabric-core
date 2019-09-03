/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Component, Input, OnInit} from '@angular/core';
import {Action} from "@ofModel/thirds.model";
import {I18n} from "@ofModel/i18n.model";
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {ThirdActionService} from "@ofServices/third-action.service";

@Component({
    selector: 'of-action',
    templateUrl: './action.component.html',
    styleUrls: ['./action.component.scss']
})
export class ActionComponent implements OnInit {

    @Input() readonly action: Action;
    @Input() readonly i18nPrefix: I18n;
    @Input() readonly lightCardId: string;
    @Input() readonly actionUrlPath: string;
    private currentActionPath: string;
    /* istanbul ignore next */
    constructor(
        private _modalService: NgbModal
        , private actionService: ThirdActionService) {
    }

    ngOnInit(): void {
        this.currentActionPath = `${this.actionUrlPath}/${this.action.key}`;
    }

    submit() {
        this.actionService.submit(
            this.lightCardId
            , this.currentActionPath
            , this.action
            , this._modalService);
    }
}
