/* Copyright (c) 2020, RTEi (http://www.rte-international.com)
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Store} from '@ngrx/store';
import {TranslateService} from '@ngx-translate/core';
import {AppState} from '@ofStore/index';

@Component({
  selector: 'of-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {

  activeTab: string;

  public paginationDefaultPageSize = 10;
  public paginationPageSizeOptions = [5, 10, 25, 50, 100];
  public paginationPageSize = this.paginationDefaultPageSize;

  constructor(private route: ActivatedRoute, protected store: Store<AppState>, protected translate: TranslateService) {
  }

  ngOnInit() {
    const url = this.route.snapshot.url.join('').trim();
    this.activeTab = (url.length !== 0) ? url : 'users';
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  onPageSizeChanged() {
    // Cast to get rid of "Property 'value' does not exist on type 'HTMLElement'."
    const value = (<HTMLInputElement> document.getElementById('page-size-select')).value;
    this.paginationPageSize = Number(value);
  }

}
