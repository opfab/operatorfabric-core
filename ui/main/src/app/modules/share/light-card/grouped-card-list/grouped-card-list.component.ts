import {Component, Input} from '@angular/core';
import {LightCard} from '@ofModel/light-card.model';
import {Observable} from 'rxjs';

@Component({
    selector: 'of-grouped-card-list',
    templateUrl: './grouped-card-list.component.html',
    styleUrls: ['./grouped-card-list.component.scss']
})
export class GroupedCardListComponent {
    @Input() public lightCards: LightCard[];
    @Input() public selection: Observable<string>;
}
