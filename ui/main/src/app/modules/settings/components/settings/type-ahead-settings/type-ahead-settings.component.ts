
import {Component, OnDestroy, OnInit} from '@angular/core';
import {MultiSettingsComponent} from "../multi-settings/multi-settings.component";
import {Store} from "@ngrx/store";
import {AppState} from "@ofStore/index";

@Component({
  selector: 'of-type-ahead-settings',
  templateUrl: './type-ahead-settings.component.html',
  styleUrls: ['./type-ahead-settings.component.scss']
})
export class TypeAheadSettingsComponent extends MultiSettingsComponent implements OnInit, OnDestroy {

    constructor(protected store: Store<AppState>) {
        super(store)
    }

}
