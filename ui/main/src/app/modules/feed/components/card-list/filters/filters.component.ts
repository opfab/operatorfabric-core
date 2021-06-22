/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



import {Component, OnInit} from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from '@ofStore/index';
import { ConfigService} from "@ofServices/config.service";
import {LightCardsService} from '@ofServices/lightcards.service';

@Component({
  selector: 'of-filters',
  templateUrl: './filters.component.html',
  styleUrls: ['./filters.component.scss']
})
export class FiltersComponent implements OnInit {

  hideAckFilter: boolean;
  hideResponseFilter: boolean;
  hideTags: boolean;
  hideTimerTags: boolean;
  hideReadSort: boolean;
  hideSeveritySort: boolean;
  
  loadingInProgress = false;

  constructor(private store: Store<AppState>, private configService: ConfigService, private lightCardsService: LightCardsService) { }

  ngOnInit() {
    this.hideTags = this.configService.getConfigValue('settings.tags.hide',false);
    this.hideTimerTags = this.configService.getConfigValue('feed.card.hideTimeFilter',false);
    this.hideAckFilter = this.configService.getConfigValue('feed.card.hideAckFilter',false);
    this.hideResponseFilter = this.configService.getConfigValue('feed.card.hideResponseFilter',false);
    this.hideReadSort = this.configService.getConfigValue('feed.card.hideReadSort',false);
    this.hideSeveritySort = this.configService.getConfigValue('feed.card.hideSeveritySort',false);
    this.lightCardsService.getLoadingInProgress().subscribe( (inProgress: boolean ) => this.loadingInProgress = inProgress)
  }


}
