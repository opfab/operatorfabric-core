import {AfterContentInit, AfterViewInit, Component, Input, OnInit} from '@angular/core';
import {I18nData, LightCard} from '@state/light-card/light-card.model';

@Component({
    selector: 'app-light-card-details',
    templateUrl: './light-card-details.component.html',
    styleUrls: ['./light-card-details.component.css']
})
export class LightCardDetailsComponent {

   @Input() public lightCard: LightCard;
    constructor() {}

}
