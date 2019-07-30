import {Injectable, OnInit} from "@angular/core";
import {environment} from "@env/environment";
import {HttpClient, HttpParams} from "@angular/common/http";
import {LightCard} from "@ofModel/light-card.model";
import {Observable} from "rxjs";
import {Action} from "@ofModel/thirds.model";
import {flatMap, map} from "rxjs/operators";
import {AppState} from "@ofStore/index";
import {Store} from "@ngrx/store";
import {selectCurrentDate} from "@ofSelectors/time.selectors";

Injectable()

export class ThirdActionsService implements OnInit {

    readonly actionsUrl: string;
    private heartBeats: Observable<any>;

    constructor(private httpClient: HttpClient,
                private store: Store<AppState>) {
        this.actionsUrl = `'${environment.urls.actions}`;

    }

    ngOnInit(): void {
        this.heartBeats = this.store.select(selectCurrentDate);
    }

    fetchActionsUsingLightCard(card: LightCard, thirdAction: Action): Observable<Map<string, Action>> {
        return this.fetchActions(card.publisher, card.process, card.state, card.publisherVersion,thirdAction.key);
    }

    fetchActions(publisher: string, process: string, state: string, version: string, thirdActionKey: string): Observable<Map<string, Action>> {
        const params = new HttpParams().set("apiVersion", version);

        return this.heartBeats.pipe(flatMap(date => {
            return this.httpClient.get(`${this.actionsUrl}/publisher/${publisher}/process/${process}/state/${state}/actions/${thirdActionKey}`, {
                params,
                responseType: 'text'
            }).pipe(map(json => {
                const obj = JSON.parse(json)
                return new Map(Object.entries(obj))
            }));

        }));

    }
}
