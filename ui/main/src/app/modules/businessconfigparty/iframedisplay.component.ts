/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



import { Component, OnInit, OnDestroy } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { ProcessesService } from '@ofServices/processes.service';
import { concatMap, map, takeUntil, skip } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';
import { Store } from '@ngrx/store';
import { AppState } from '@ofStore/index';
import { selectGlobalStyleState } from '@ofSelectors/global-style.selectors';
import { GlobalStyleService } from '@ofServices/global-style.service';


@Component({
  selector: 'of-iframedisplay',
  templateUrl: './iframedisplay.component.html',
  styleUrls: ['./iframedisplay.component.scss']
})
export class IframeDisplayComponent implements OnInit, OnDestroy {

  public iframeURL: Observable<SafeUrl>;
  unsubscribe$: Subject<void> = new Subject<void>();

  constructor(
    private sanitizer: DomSanitizer,
    private route: ActivatedRoute,
    private businessconfigService: ProcessesService,
    private store: Store<AppState>,
    private globalStyleService: GlobalStyleService
  ) {
   }

  ngOnInit() {
    this.loadIframe();
    this.reloadIframeWhenGlobalStyleChange();
  }


  private loadIframe() {
    this.iframeURL = this.route.paramMap.pipe(
    concatMap(paramMap =>
      this.businessconfigService.queryMenuEntryURL(paramMap.get("menu_id"), paramMap.get("menu_version"), paramMap.get("menu_entry_id"))
    ),
    map((url) => this.addOpfabThemeParamToUrl(url)),
    map(this.sanitizer.bypassSecurityTrustResourceUrl));
  }


  private addOpfabThemeParamToUrl(url: string ): string {
    this.globalStyleService.getStyle();
    url += (url.includes('?')) ? '&' : '?';
    url += 'opfab_theme=';
    url += this.globalStyleService.getStyle();
    return url;
  }


  private reloadIframeWhenGlobalStyleChange() {
    this.store.select(selectGlobalStyleState)
      .pipe(takeUntil(this.unsubscribe$), skip(1))
      .subscribe(() => this.loadIframe());
  }


  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

}
