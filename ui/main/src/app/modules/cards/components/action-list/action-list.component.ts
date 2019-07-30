import {Component, Input, OnInit} from '@angular/core';
import {Action} from "@ofModel/thirds.model";
import {I18n} from "@ofModel/i18n.model";

@Component({
  selector: 'of-action-list',
  templateUrl: './action-list.component.html',
  styleUrls: ['./action-list.component.scss']
})
export class ActionListComponent implements OnInit {

  @Input()public actions:Action[];
  @Input() readonly i18nPrefix:I18n;
  @Input() readonly actionsUrlPath:string;
  constructor() { }

  ngOnInit() {
  }

}
