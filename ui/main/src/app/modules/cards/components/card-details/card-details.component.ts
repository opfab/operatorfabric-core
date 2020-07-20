import { Component, OnInit, OnDestroy } from '@angular/core';
import { Card, Detail} from '@ofModel/card.model';
import { Store } from '@ngrx/store';
import { AppState } from '@ofStore/index';
import * as cardSelectors from '@ofStore/selectors/card.selectors';
import { ProcessesService } from "@ofServices/processes.service";
import {Subject} from 'rxjs';
import {takeUntil, switchMap} from 'rxjs/operators';
import { selectIdentifier } from '@ofStore/selectors/authentication.selectors';
import { UserService } from '@ofServices/user.service';
import { User } from '@ofModel/user.model';
import { UserWithPerimeters } from '@ofModel/userWithPerimeters.model';
import { selectCurrentUrl } from '@ofStore/selectors/router.selectors';
import { AppService } from '@ofServices/app.service';

@Component({
    selector: 'of-card-details',
    templateUrl: './card-details.component.html',
    styleUrls: ['./card-details.component.scss']
})
export class CardDetailsComponent implements OnInit, OnDestroy {

    card: Card;
    childCards: Card[];
    user: User;
    userWithPerimeters: UserWithPerimeters;
    details: Detail[];
    unsubscribe$: Subject<void> = new Subject<void>();
    private _currentPath: string;

    constructor(private store: Store<AppState>,
        private businessconfigService: ProcessesService, private userService: UserService, 
        private appService: AppService) {
    }

    ngOnInit() {
        this.store.select(cardSelectors.selectCardStateSelectedWithChildCards)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe(([card, childCards]: [Card, Card[]]) => {
                this.card = card;
                this.childCards = childCards;
                if (card) {
                    if (card.details) {
                        this.details = [...card.details];
                    } else {
                        this.details = [];
                    }
                    this.businessconfigService.queryProcess(this.card.process, this.card.processVersion)
                        .pipe(takeUntil(this.unsubscribe$))
                        .subscribe(businessconfig => {
                            if (businessconfig) {
                                const state = businessconfig.extractState(this.card);
                                if (state != null) {
                                    this.details.push(...state.details);
                                }
                            }
                        },
                            error => console.log(`something went wrong while trying to fetch process for ${this.card.process} with ${this.card.processVersion} version.`)
                        );
                }
            });

        let userId = null;
        this.store.select(selectIdentifier)
            .pipe(takeUntil(this.unsubscribe$))
            .pipe(switchMap(id => {
                    userId = id;
                    return this.userService.askUserApplicationRegistered(userId)
                }))
            .subscribe(user => {
                if (user) {
                    this.user = user
                }
            },
                error => console.log(`something went wrong while trying to ask user application registered service with user id : ${userId}`)
            );

        this.userService.currentUserWithPerimeters()
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe(userWithPerimeters => {
                if (userWithPerimeters) {
                    this.userWithPerimeters = userWithPerimeters;
                }
            },
                error => console.log(`something went wrong while trying to have currentUser with perimeters `)
            );

        this.store.select(selectCurrentUrl)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe(url => {
                if (url) {
                    const urlParts = url.split('/');
                    this._currentPath = urlParts[1];
                }
            });
    }

    closeDetails() {
        this.appService.closeDetails(this._currentPath);
    }

    ngOnDestroy() {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
