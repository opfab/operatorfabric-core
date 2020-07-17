/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



import { Component, OnInit, OnDestroy} from '@angular/core';
import {MatDialogRef} from '@angular/material';
import { Subject } from 'rxjs';
import { takeUntil, skip } from 'rxjs/operators';
import { selectCurrentUrl } from '@ofStore/selectors/router.selectors';
import {AppState} from '@ofStore/index';
import { Store } from '@ngrx/store';


@Component({
  selector: 'of-calendar-card-view',
  templateUrl: './fullscreen-card-view.component.html'
})
export class FullscreenCardViewComponent implements OnInit, OnDestroy {

  private unsubscribe$ = new Subject<void>();

  constructor(
    private dialogRef: MatDialogRef<FullscreenCardViewComponent>,
    private store: Store<AppState>) { }

  ngOnInit() {
    this.closeWhenClickingOnMenuLink();
  }

  private closeWhenClickingOnMenuLink() {
    this.store.select(selectCurrentUrl).pipe(takeUntil(this.unsubscribe$), skip(1)).subscribe( () => this.close());
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  close() {
    this.dialogRef.close();
  }
}