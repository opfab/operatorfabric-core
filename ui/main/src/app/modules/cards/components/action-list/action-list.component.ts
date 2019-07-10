import {Component, Input, OnInit} from '@angular/core';
import {Action} from "@ofModel/thirds.model";

@Component({
  selector: 'of-action-list',
  templateUrl: './action-list.component.html',
  styleUrls: ['./action-list.component.scss']
})
export class ActionListComponent implements OnInit {

  @Input()public actions:Map<string,Action>

  constructor() { }

  ngOnInit() {
  }

}
