

import {Injectable} from '@angular/core';
import {Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {Store} from "@ngrx/store";
import {AppState} from "@ofStore/index";
import {environment} from "@env/environment";

@Injectable()
export class ConfigService {
    private configUrl: string;

    constructor(private httpClient: HttpClient,
                private store: Store<AppState>) {
        this.configUrl = `${environment.urls.config}`;
    }

    fetchConfiguration(): Observable<any> {
        return this.httpClient.get(`${this.configUrl}`)
    }
}
