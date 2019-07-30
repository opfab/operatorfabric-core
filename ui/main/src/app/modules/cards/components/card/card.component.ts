/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Component, Input, OnInit} from '@angular/core';
import {LightCard} from '@ofModel/light-card.model';
import {Router} from '@angular/router';
import {selectCurrentUrl} from '@ofStore/selectors/router.selectors';
import {Store} from '@ngrx/store';
import {AppState} from '@ofStore/index';
import {map} from "rxjs/operators";
import {buildConfigSelector} from "@ofSelectors/config.selectors";
import {TranslateService} from "@ngx-translate/core";
import {TimeService} from "@ofServices/time.service";
import {Action} from "@ofModel/thirds.model";
import {ThirdsService} from "@ofServices/thirds.service";
import {AddThirdActions} from "@ofActions/light-card.actions";

@Component({
    selector: 'of-card',
    templateUrl: './card.component.html',
    styleUrls: ['./card.component.scss']
})
export class CardComponent implements OnInit {

    @Input() public open: boolean = false;
    @Input() public lightCard: LightCard;
    currentPath: any;
    protected _i18nPrefix: string;
    dateToDisplay: string;
    actionsUrlPath:string;
    /* istanbul ignore next */
    constructor(private router: Router,
                private store: Store<AppState>,
                private translate: TranslateService,
                private time: TimeService,
                private third:ThirdsService
    ){
    }

    public select() {
        this.router.navigate(['/' + this.currentPath, 'cards', this.lightCard.id]);
        if(!this.lightCard.actions){
            this.third.fetchActionMapFromLightCard(this.lightCard)
                .subscribe(actions => {
                    const card = this.lightCard;
                    this.store.dispatch(new AddThirdActions({card,actions}))
                    },
                error=>console.error(error));
        }
    }

    transformAction(){
        const actions = this.lightCard.actions;
        if(actions){
            const entries = Array.from(actions.entries())
            return entries.map<Action>(([key,action]:[string,Action])=>{
                return {...action,key:key}
            });
        }
            return [];
    }


    ngOnInit() {
        this._i18nPrefix = this.lightCard.publisher + '.' + this.lightCard.publisherVersion + '.'
        this.store.select(selectCurrentUrl).subscribe(url => {
            if (url)
                this.currentPath = url.split('/')[1];
        });
        this.store.select(buildConfigSelector('feed.card.time.display'))
        // use configuration to compute date
            .pipe(map(config => this.computeDisplayedDates(config, this.lightCard)))
            .subscribe(computedDate => this.dateToDisplay = computedDate);

        const c=this.lightCard;
        this.actionsUrlPath = `/publisher/${c.publisher}/process/${c.processId}/states/${c.state}/actions`;
    }

    computeDisplayedDates(config: string, lightCard: LightCard): string {
        switch (config) {
            case 'NONE':
                return '';
            case 'LTTD':
                return this.handleDate(lightCard.lttd);
            case 'PUBLICATION':
                return this.handleDate(lightCard.publishDate);
            case 'BUSINESS_START':
                return this.handleDate(lightCard.startDate);
            default:
                return `${this.handleDate(lightCard.startDate)} - ${this.handleDate(lightCard.endDate)}`
        }
    }

    handleDate(timeStamp: number): string {
        return this.time.formatDateTime(timeStamp);
    }

    get i18nPrefix(): string {
        return this._i18nPrefix;
    }

}
