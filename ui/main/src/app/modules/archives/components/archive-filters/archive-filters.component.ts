/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Component, OnInit, Input } from '@angular/core';
import {Observable} from 'rxjs';
import {Store} from '@ngrx/store';
import {AppState} from '@ofStore/index';
import {buildConfigSelector} from '@ofSelectors/config.selectors';
import {TryToLogIn} from '@ofActions/authentication.actions';
import {SendArchiveQuery} from '@ofActions/archive.actions';
import {selectArchiveFilters} from '@ofSelectors/archive.selectors';
import { ArchiveService } from '@ofServices/archive.service';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { I18n } from '@ofModel/i18n.model';

@Component({
  selector: 'of-archive-filters',
  templateUrl: './archive-filters.component.html',
  styleUrls: ['./archive-filters.component.css']
})
export class ArchiveFiltersComponent implements OnInit {

  publishers$: Observable<string []>;
  processes$: Observable<string []>;

  preparedList: { value: string, label: Observable<string> }[];
  @Input() values: ({ value: string, label: (I18n | string) } | string)[];

  // filters: Map<string, string[]>;
  archiveForm: FormGroup;
  
  // @Input() values: ({ value: string, label: (I18n | string) } | string)[];

  constructor(private store: Store<AppState>,
    private archiveService: ArchiveService,
    private fb: FormBuilder) { }


  ngOnInit() {
    this.publishers$ = this.store.select(buildConfigSelector('archive.filters.publisher.list'));
    this.processes$ = this.store.select(buildConfigSelector('archive.filters.process.list'));

    this.publishers$.subscribe(data =>  console.log(data));

    

    this.archiveForm = new FormGroup({
      publisher: new FormControl(),
      process: new FormControl(),
      startNotification: new FormControl(),
      endNotification: new FormControl(),
      startBusiness: new FormControl(),
      endBusiness: new FormControl()
    }, {updateOn: 'change'});

    /*
    this.preparedList = [];
    if (this.values) {
      for (const v of this.values) {
        if (typeof v === 'string') {
          this.preparedList.push({value: v, label: of(v)});
        } else if (typeof v.label === 'string') {
          this.preparedList.push({value: v.value, label: of(v.label)});
        } else {
          this.preparedList.push({
            value: v.value,
            label: this.translateService.get(v.label.key, v.label.parameters)
          });
        }
      }
    }
    */
    
    // this.store.select(selectArchiveFilters).subscribe( next => this.filters = next);
  }

  // (filters: Map<string, string[]>): Observable<LightCard[]>
  sendQuery(): void {
    console.log(this.archiveForm.value);
    const params = new Map();
    params.set('publisher', ['TEST1']);
    const params1 = 'publisher=TEST1';
    this.store.dispatch(new SendArchiveQuery({params: params1}));
    // this.archiveService.fetchArchivedCards(params).subscribe(data => console.log(data));

  }

}
