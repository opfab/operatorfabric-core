
import { Component, OnInit } from '@angular/core';
import {Store} from "@ngrx/store";
import {AppState} from "@ofStore/index";
import {ChangeSort} from "@ofActions/feed.actions";

@Component({
  selector: 'of-severity-sort',
  templateUrl: './severity-sort.component.html'
})export class SeveritySortComponent implements OnInit {

  toggleActive = false;

  constructor(private store: Store<AppState>) { }

  ngOnInit() {
  }

  toggleSort(): void {
    this.toggleActive = !this.toggleActive;
    this.store.dispatch(new ChangeSort());
  }

}
