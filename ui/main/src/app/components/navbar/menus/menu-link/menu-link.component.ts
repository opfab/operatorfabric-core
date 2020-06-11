
import {Component, Input, OnInit} from '@angular/core';
import {ThirdMenu, ThirdMenuEntry} from "@ofModel/thirds.model";
import {buildConfigSelector} from "@ofSelectors/config.selectors";
import {Store} from "@ngrx/store";
import {AppState} from "@ofStore/index";

@Component({
  selector: 'of-menu-link',
  templateUrl: './menu-link.component.html',
  styleUrls: ['./menu-link.component.scss']
})
export class MenuLinkComponent implements OnInit {

  @Input() public menu: ThirdMenu;
  @Input() public menuEntry: ThirdMenuEntry;
  menusOpenInTabs: boolean;
  menusOpenInIframes: boolean;
  menusOpenInBoth: boolean;

  constructor(private store: Store<AppState>) {
  }

  ngOnInit() {
    this.store.select(buildConfigSelector('navbar.thirdmenus.type', 'BOTH'))
        .subscribe(v=> {
          if(v == 'TAB') {
            this.menusOpenInTabs = true;
          } else if (v == 'IFRAME') {
            this.menusOpenInIframes = true;
          } else {
            if (v != 'BOTH') {
              console.log("MenuLinkComponent - Property navbar.thirdmenus.type has an unexpected value: "+v+". Default (BOTH) will be applied.")
            }
            this.menusOpenInBoth = true;
          }
        })
  }
}


