/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Component, OnInit } from '@angular/core';
import {Observable, combineLatest} from 'rxjs';
import {Store} from '@ngrx/store';
import {AppState} from '@ofStore/index';
import {buildConfigSelector} from '@ofSelectors/config.selectors';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { TimeService } from '@ofServices/time.service';

@Component({
  selector: 'of-archive-filters',
  templateUrl: './archive-filters.component.html',
  styleUrls: ['./archive-filters.component.css']
})
export class ArchiveFiltersComponent implements OnInit {

  publishers$: Observable<string []>;
  processes$: Observable<string []>;

  archiveForm: FormGroup;

  constructor(private store: Store<AppState>,
    private fb: FormBuilder,
    private timeService: TimeService) { }


  ngOnInit() {
    this.publishers$ = this.store.select(buildConfigSelector('archive.filters.publisher.list'));
    this.processes$ = this.store.select(buildConfigSelector('archive.filters.process.list'));
    this.archiveForm = this.fb.group({
      publisher: new FormControl(),
      process: new FormControl(),
      startNotificationd: '',
      startNotificationt: '',
      endNotificationd: '',
      endNotificationt: '',
      startBusinessd: '',
      startBusinesst: '',
      endBusinessd: '',
      endBusinesst: ''
    });
  }

  sendQuery(): void {
    console.log(this.archiveForm.value);
    const sNd = this.archiveForm.controls['startNotificationd'].value;
    const sNt = this.archiveForm.controls['startNotificationt'].value;
    const eNd = this.archiveForm.controls['endNotificationd'].value;
    const eNt = this.archiveForm.controls['endNotificationt'].value;
    const sBd = this.archiveForm.controls['startBusinessd'].value;
    const sBt = this.archiveForm.controls['startBusinesst'].value;
    const eBd = this.archiveForm.controls['endBusinessd'].value;
    const eBt = this.archiveForm.controls['endBusinesst'].value;
    // 'YYYY-MM-DDTHH:mm'
    const startNotif = `${sNd.year}-${sNd.month - 1}-${sNd.day}T${sNt.hour}:${sNt.minute}`;
    const endNotif = `${eNd.year}-${eNd.month - 1}-${eNd.day}T${eNt.hour}:${eNt.minute}`;
    const startBusn = `${sBd.year}-${sBd.month - 1}-${sBd.day}T${sBt.hour}:${sBt.minute}`;
    const endBusn = `${eBd.year}-${eBd.month - 1}-${eBd.day}T${eBt.hour}:${eBt.minute}`;
    console.log(this.timeService.parseString(startNotif).valueOf(), endNotif, startBusn, endBusn);


    // console.log(this.timeService.parseString(stringTime).valueOf());
    // this.store.dispatch(new SendArchiveQuery(params1));
    // this.archiveService.fetchArchivedCards(params).subscribe(data => console.log(data));
  }

  

}
