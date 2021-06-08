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
import {SharingService} from './services/sharing.service';

@Component({
  selector: 'of-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {

  public paginationDefaultPageSize = 10;
  public paginationPageSizeOptions = [5, 10, 25, 50, 100];

  constructor(private route: ActivatedRoute,
              protected store: Store<AppState>,
              protected translate: TranslateService,
              private dataHandlingService: SharingService) {
  }

  ngOnInit() {
    this.dataHandlingService.changePaginationPageSize(this.paginationDefaultPageSize);
  }

  onPageSizeChanged() {
    // Cast to get rid of "Property 'value' does not exist on type 'HTMLElement'."
    const value = (<HTMLInputElement> document.getElementById('opfab-page-size-select')).value;
    this.dataHandlingService.changePaginationPageSize(Number(value));
  }

}
