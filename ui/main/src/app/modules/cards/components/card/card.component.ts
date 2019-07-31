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
import {map, take, tap} from "rxjs/operators";
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
    private actions:Action[];
    /* istanbul ignore next */
    constructor(private router: Router,
                private store: Store<AppState>,
                private translate: TranslateService,
                private time: TimeService,
                private third:ThirdsService
    ){
    }

     ngOnInit() {
        const card=this.lightCard;
        this._i18nPrefix = card.publisher + '.' + card.publisherVersion + '.'
        this.store.select(selectCurrentUrl).subscribe(url => {
            if (url)
                this.currentPath = url.split('/')[1];
                this.initActions();
        });
        this.store.select(buildConfigSelector('feed.card.time.display'))
        // use configuration to compute date
            .pipe(map(config => this.computeDisplayedDates(config, card)))
            .subscribe(computedDate => this.dateToDisplay = computedDate);


        this.actionsUrlPath = `/publisher/${card.publisher}/process/${card.processId}/states/${card.state}/actions`;
    }

    private initActions() {
        const card = this.lightCard;
        if (!card.actions && !this.actions) {
            this.third.fetchActionMapFromLightCard(card)
                .subscribe(actions => {
                        this.store.dispatch(new AddThirdActions({card, actions}))
                    },
                    error => {
                        if (error.status && error.status == 404) {
                            console.log(`no actions available for ${card.id}`);
                        } else {
                            console.error(error);
                        }
                    });
        }
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

    public select() {
        this.router.navigate(['/' + this.currentPath, 'cards', this.lightCard.id]);
        this.initActions();
    }


    /* necessary otherwise action buttons are weirdly refresh */
    getActions(){
        if(!this.actions){
            this.actions=this.transformActionMapToArray();
        }
        return this.actions;
    }

    transformActionMapToArray(){
        const actions = this.lightCard.actions;
        if(actions){
            const entries = Array.from(actions.entries())
            return entries.map<Action>(([key,action]:[string,Action])=>{
                return {...action,key:key}
            });
        }
        return [];
    }

    get i18nPrefix(): string {
        return this._i18nPrefix;
    }

}
