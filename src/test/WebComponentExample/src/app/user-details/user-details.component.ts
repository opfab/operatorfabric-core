import { Component, Input } from '@angular/core';


declare const opfab: any;

@Component({
  selector: 'app-user-details',
  templateUrl: './user-details.component.html',
  styleUrls: ['./user-details.component.scss']
})
export class UserDetailsComponent {

  @Input() title: string = "";

  getDetails() {
    return opfab.webComponent.getUserDetails();
  }

}
