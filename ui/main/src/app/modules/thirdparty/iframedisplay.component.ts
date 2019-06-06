/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Component, OnInit } from '@angular/core';
import {Observable} from "rxjs";
import {
  selectMenuStateMenu,
  selectMenuStateSelectedMenuEntryId,
  selectMenuStateSelectedMenuId
} from "@ofSelectors/menu.selectors";
import {Store} from "@ngrx/store";
import {AppState} from "@ofStore/index";
import {ThirdMenu, ThirdMenuEntry} from "@ofModel/thirds.model";
import {DomSanitizer, SafeUrl} from "@angular/platform-browser";
import {map, pluck} from "rxjs/operators";
import {combineLatest} from "rxjs/internal/observable/combineLatest";
import {withLatestFrom} from "rxjs/internal/operators/withLatestFrom";

@Component({
  selector: 'of-iframedisplay',
  templateUrl: './iframedisplay.component.html',
  styleUrls: ['./iframedisplay.component.scss']
})
export class IframeDisplayComponent implements OnInit {

  private _menu_id : string;
  private _menu_entry_id : string;
  private _currentSelection: {selectedThirdMenu: ThirdMenu,selectedThirdMenuEntry: ThirdMenuEntry,selectedURL: string};

  constructor(private store: Store<AppState>,
              private sanitizer: DomSanitizer
  ) { }

  ngOnInit() {

    this.store.select(selectMenuStateSelectedMenuId).subscribe(menu_id => {
      this._menu_id = menu_id;
    });
    this.store.select(selectMenuStateSelectedMenuEntryId).subscribe(menu_entry_id => {
      this._menu_entry_id = menu_entry_id;
    });

    //TODO Init currentSelection in separate function, handle undefined / not found better
    combineLatest(this.store.select(selectMenuStateSelectedMenuId),this.store.select(selectMenuStateSelectedMenuEntryId)) //Emit a [menu_entry_id,menu_entry_id] array every time any of them is updated
        .pipe(
            withLatestFrom(this.store.select(selectMenuStateMenu)), //Add latest emitted value from selectMenuStateMenu to emission [menu_entry_id, menu_entry_id, thirdMenus]
            map((currentSelection: [[string,string],ThirdMenu[]]) => {
              let selectedThirdMenu: ThirdMenu;
              let selectedThirdMenuEntry: ThirdMenuEntry;
              let selectedURL: string;
              if(!this.getMenuById(currentSelection[0][0],currentSelection[1])[0]) { //If no ThirdMenu with this id exists
                selectedThirdMenu = undefined;
                selectedThirdMenuEntry = undefined;
                selectedURL = undefined;
              } else {
                selectedThirdMenu = this.getMenuById(currentSelection[0][0],currentSelection[1])[0]
                if(!this.getMenuEntryById(currentSelection[0][1],selectedThirdMenu)[0]){ //If no ThirdMenuEntry with this id exists
                  selectedThirdMenuEntry = undefined;
                  selectedURL = undefined;
                } else {
                  selectedThirdMenuEntry = this.getMenuEntryById(currentSelection[0][1],selectedThirdMenu)[0];
                  selectedURL = selectedThirdMenuEntry.url;
                }
              }
              return {selectedThirdMenu: selectedThirdMenu, selectedThirdMenuEntry: selectedThirdMenuEntry, selectedURL: selectedURL};
            }
        )).subscribe( currentSelection => {
          this._currentSelection = currentSelection;
        })
  }

  get menu_id(): string {
    return this._menu_id;
  }

  get menu_entry_id(): string {
    return this._menu_entry_id;
  }

  get selectedThirdMenu(): ThirdMenu {
    return this._currentSelection.selectedThirdMenu;
  }

  get selectedThirdMenuEntry(): ThirdMenuEntry {
    return this._currentSelection.selectedThirdMenuEntry;
  }

  get iframeURL(): string {
    return this._currentSelection.selectedURL;
  }
  //TODO See if we really need the iframeURL intermediate step anywhere

  get safeIframeURL(): SafeUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(this.iframeURL)
  }

  getMenuById(menu_id: string, thirdMenus: ThirdMenu[]): ThirdMenu[]{ //Assuming it should only return 0 or 1 ThirdMenus
    return thirdMenus.filter((thirdMenu: ThirdMenu) => {
      return thirdMenu.id === menu_id;
    })
  }

  getMenuEntryById(menu_entry_id: string, thirdMenu: ThirdMenu): ThirdMenuEntry[]{
    return thirdMenu.entries.filter((menuEntry: ThirdMenuEntry) => {
      return menuEntry.id === menu_entry_id;
    })
  }

}
