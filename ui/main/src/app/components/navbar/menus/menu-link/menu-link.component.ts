import {Component, Input, OnInit} from '@angular/core';
import {LightCard} from "@ofModel/light-card.model";
import {ThirdMenu, ThirdMenuEntry} from "@ofModel/thirds.model";

@Component({
  selector: 'of-menu-link',
  templateUrl: './menu-link.component.html',
  styleUrls: ['./menu-link.component.scss']
})
export class MenuLinkComponent implements OnInit {

  @Input() public menu: ThirdMenu;
  @Input() public menuEntry: ThirdMenuEntry;

  constructor() { }

  ngOnInit() {
  }

}
