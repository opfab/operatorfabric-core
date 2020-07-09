/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { AppState } from '@ofStore/index';
import { buildSettingsOrConfigSelector } from '@ofStore/selectors/settings.x.config.selectors';
import * as moment from 'moment';
import { ConfigService} from "@ofServices/config.service";

@Component({
    selector: 'of-time-line',
    templateUrl: './time-line.component.html',
})
export class TimeLineComponent implements OnInit, OnDestroy {

    localSubscription: Subscription;

    public confDomain = [];
    public domains: any;


    constructor(private store: Store<AppState>,private  configService: ConfigService) { }
    ngOnInit() {

        this.loadConfiguration();
        this.loadDomainsListFromConfiguration();

        this.localSubscription = this.store.select(buildSettingsOrConfigSelector('locale')).subscribe(
            l => moment.locale(l)
        )

    }

    loadConfiguration() {
    
        this.domains = {
            J: {
                buttonTitle: 'timeline.buttonTitle.J',
                domainId:'J',
            }, TR: {
                buttonTitle: 'timeline.buttonTitle.TR',
                domainId : 'TR',
            }, '7D': {
                buttonTitle: 'timeline.buttonTitle.7D',
                domainId:'7D',
                followClockTick: true
            }, 'W': {
                buttonTitle: 'timeline.buttonTitle.W',
                domainId : 'W',
                followClockTick: false
            }, M: {
                buttonTitle: 'timeline.buttonTitle.M',
                domainId : 'M',
                followClockTick: false
            }, Y: {
                buttonTitle: 'timeline.buttonTitle.Y',
                domainId: 'Y',
                followClockTick: false
            }
        };

    }


    loadDomainsListFromConfiguration() {

        const domainsConf = this.configService.getConfigValue('feed.timeline.domains', ["TR", "J", "7D", "W", "M", "Y"]);
        domainsConf.map(domain => {
            if (Object.keys(this.domains).includes(domain)) {
                this.confDomain.push(this.domains[domain]);
            }
        });

    }


    ngOnDestroy() {

        if (this.localSubscription) {
            this.localSubscription.unsubscribe();
        }
        
    }
}
