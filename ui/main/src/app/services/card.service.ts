

import {Injectable} from '@angular/core';
import {Observable, of, Subject} from 'rxjs';
import {CardOperation} from '@ofModel/card-operation.model';
import {EventSourcePolyfill} from 'ng-event-source';
import {AuthenticationService} from './authentication/authentication.service';
import {Card} from '@ofModel/card.model';
import {HttpClient, HttpParams} from '@angular/common/http';
import {environment} from '@env/environment';
import {GuidService} from '@ofServices/guid.service';
import {LightCard} from '@ofModel/light-card.model';
import {Page} from '@ofModel/page.model';
import {TimeService} from '@ofServices/time.service';
import {NotifyService} from '@ofServices/notify.service';

@Injectable()
export class CardService {
    private static MINIMUM_DELAY_FOR_SUBSCRIPTION = 1000;
    readonly unsubscribe$ = new Subject<void>();
    readonly cardOperationsUrl: string;
    readonly cardsUrl: string;
    readonly archivesUrl: string;
    private subscriptionTime = 0;

    constructor(private httpClient: HttpClient,
                private notifyService: NotifyService,
                private guidService: GuidService,
                private timeService: TimeService,
                private authService: AuthenticationService) {
        const clientId = this.guidService.getCurrentGuidString();
        this.cardOperationsUrl = `${environment.urls.cards}/cardSubscription?clientId=${clientId}`;
        this.cardsUrl = `${environment.urls.cards}/cards`;
        this.archivesUrl = `${environment.urls.cards}/archives`;
    }

    loadCard(id: string): Observable<Card> {
        return this.httpClient.get<Card>(`${this.cardsUrl}/${id}`);
    }

    getCardOperation(): Observable<CardOperation> {
        const oneHourInMilliseconds = 60 * 60 * 1000;
        const minus2Hour = new Date(new Date().valueOf() - 2 * oneHourInMilliseconds);
        const plus48Hours = new Date(minus2Hour.valueOf() + 48 * oneHourInMilliseconds);
        // security header needed here as SSE request are not intercepted by our header interceptor
        const oneYearInMilliseconds = 31536000000;
        return this.fetchCardOperation(new EventSourcePolyfill(
            `${this.cardOperationsUrl}&notification=true&rangeStart=${minus2Hour.valueOf()}&rangeEnd=${plus48Hours.valueOf()}`
            , {
                headers: this.authService.getSecurityHeader(),
                /** We loose sometimes cards when reconnecting after a heartbeat timeout
                 * ..there 's no way to inhibit this heartbeat timeout
                 * so putting it to 31536000000 milliseconds make it sufficiently long (1 year)
                 * Anyway the token will expire long before and the connection will restart
                 */
                heartbeatTimeout: oneYearInMilliseconds
            }));
    }


    unsubscribeCardOperation() {
        this.unsubscribe$.next();
    }

    fetchCardOperation(eventSource: EventSourcePolyfill): Observable<CardOperation> {
        this.subscriptionTime = new Date().getTime();
        console.log(new Date().toISOString()
            , 'BUG OC-604 card.services.ts fetch card set subscription time to '
            , this.subscriptionTime);
        return Observable.create(observer => {
            try {
                eventSource.onmessage = message => {
                    this.notifyService.createNotification(`New cards are being pushed`);
                    if (!message) {
                        return observer.error(message);
                    }
                    return observer.next(JSON.parse(message.data, CardOperation.convertTypeIntoEnum));
                };
                eventSource.onerror = error => {
                    console.error(`error occurred from ES: ${error.toString()}`);
                };

            } catch (error) {
                console.error('an error occurred', error);
                return observer.error(error);
            }
            return () => {
                if (eventSource && eventSource.readyState !== eventSource.CLOSED) {
                    eventSource.close();
                }
            };
        });
    }

    public updateCardSubscriptionWithDates(rangeStart: number, rangeEnd: number): Observable<any> {

        /**
         * Hack to solve OC 604 bug
         * Depending on the network conditions, it may appends that the subscription is not totally configured
         * in the backend when we try to update it.
         * To solve this , we wait a minimum delay after subscription creation request  to make an updateSubscribe request
         *
         * It as well possible to have a update subscription ask form NGRX before the create subscription,
         * in this case we wait 2 times the minimum delay
         *
         * This solution should be replace with a more robust one (the backend should be modify to send
         * an information saying the subscription is OK )
         */
        let timeout = 0;
        const currentTime = new Date().getTime();
        if (this.subscriptionTime === 0) {
            timeout = CardService.MINIMUM_DELAY_FOR_SUBSCRIPTION * 2;
        } else {
            const delayAfterSubscription = currentTime - this.subscriptionTime;
            if (delayAfterSubscription < CardService.MINIMUM_DELAY_FOR_SUBSCRIPTION) {
                timeout = CardService.MINIMUM_DELAY_FOR_SUBSCRIPTION - delayAfterSubscription;
            }
        }
        console.log(new Date().toISOString()
            , `BUG OC-604 card.services.ts send  updateCardSubscriptionWithDates in ${timeout} ms`);
        setTimeout(() => {
            this.httpClient.post<any>(
                `${this.cardOperationsUrl}`,
                {rangeStart: rangeStart, rangeEnd: rangeEnd}).subscribe();
        }, timeout);

        return of();
    }

    loadArchivedCard(id: string): Observable<Card> {
        return this.httpClient.get<Card>(`${this.archivesUrl}/${id}`);
    }

    fetchArchivedCards(filters: Map<string, string[]>): Observable<Page<LightCard>> {
        let params = new HttpParams();
        filters.forEach((values, key) => values.forEach(value => params = params.append(key, value)));
        // const tmp = new HttpParams().set('publisher', 'defaultPublisher').set('size', '10');
        return this.httpClient.get<Page<LightCard>>(`${this.archivesUrl}/`, {params});
    }
}
