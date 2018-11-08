import {Component, Input} from '@angular/core';
import {LightCard} from '../../../../state/light-card/light-card.model';

@Component({
  selector: 'app-cards-list',
  templateUrl: './light-cards-list.component.html',
  styleUrls: ['./light-cards-list.component.css']
})
export class LightCardsListComponent  {

  @Input() public lightCards: LightCard[];

  constructor() { }


}
