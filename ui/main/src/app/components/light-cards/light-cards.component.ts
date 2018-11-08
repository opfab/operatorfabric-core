import {AfterViewInit, Component, OnInit} from '@angular/core';
import {select, Store} from '@ngrx/store';
import {AppState} from '@state/app.interface';
import {Observable} from 'rxjs';
import {LightCard} from '@state/light-card/light-card.model';
import * as fromStore from '@state/light-card/index';

@Component({
    selector: 'app-cards',
    templateUrl: './light-cards.component.html',
    styleUrls: ['./light-cards.component.css']
})
export class LightCardsComponent implements OnInit, AfterViewInit {

    lightCards$: Observable<LightCard[]>;

    constructor(private store: Store<AppState>) {
    }

    ngOnInit() {
        this.lightCards$ = this.store.pipe(select(fromStore.getAllLightCards));
    }


    ngAfterViewInit() {
    }
}
