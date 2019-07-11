import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'of-action',
  templateUrl: './action.component.html',
  styleUrls: ['./action.component.scss']
})
export class ActionComponent implements OnInit {

  @Input() readonly name
  constructor() { }

  ngOnInit() {
  }

}
