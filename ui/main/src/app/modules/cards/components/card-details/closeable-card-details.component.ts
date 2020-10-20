import {CardDetailsComponent} from './card-details.component';
import {Component} from '@angular/core';
import {Store} from '@ngrx/store';
import {AppState} from '@ofStore/index';
import {ProcessesService} from '@ofServices/processes.service';
import {UserService} from '@ofServices/user.service';
import {AppService} from '@ofServices/app.service';

@Component({
    selector: 'of-closeable-card-details',
    template: `
        <of-details [card]="card" [style.visibility]="card ? 'visible' : 'hidden'">
            <div *ngIf="card">
                <button type="button" class="close" aria-label="Close" (click)="closeDetails()">
                    <span aria-hidden="true">&times;</span>
                </button>
                <of-detail *ngFor="let detail of (details)" [detail]="detail" [card]="card" [childCards]="childCards"
                           [user]="user" [currentPath]="_currentPath"></of-detail>
            </div>
        </of-details>`,
    styleUrls: ['./closeable-card-details.component.scss']
})
export class CloseableCardDetailsComponent extends CardDetailsComponent {

    constructor(store: Store<AppState>
        , businessconfigService: ProcessesService
        , userService: UserService
        , appService: AppService) {
        super(store, businessconfigService, userService, appService);
    }

    closeDetails() {
        this.appService.closeDetails(this._currentPath);
    }

}
