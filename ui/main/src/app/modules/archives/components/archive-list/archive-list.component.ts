

import { Component, Input, OnInit } from '@angular/core';
import { LightCard } from '@ofModel/light-card.model';
import { Observable } from 'rxjs';
import { AppState } from '@ofStore/index';
import { Store } from '@ngrx/store';

@Component({
  selector: 'of-archive-list',
  templateUrl: './archive-list.component.html',
  styleUrls: ['./archive-list.component.scss']
})
export class ArchiveListComponent implements OnInit {

  @Input() public lightCards: LightCard[];
  @Input() public selection: Observable<string>;

  constructor(private store: Store<AppState>) { }

  ngOnInit(): void {
  }


}
