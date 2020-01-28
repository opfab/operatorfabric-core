
import {Injectable} from '@angular/core';
import {Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {Store} from "@ngrx/store";
import {AppState} from "@ofStore/index";
import {environment} from "@env/environment";
import {selectIdentifier} from "@ofSelectors/authentication.selectors";

@Injectable()
export class SettingsService {
    private usersUrl: string;
    private userId: string;

    constructor(private httpClient: HttpClient,
                private store: Store<AppState>) {
        this.usersUrl = `${environment.urls.users}`;
        this.store.select(selectIdentifier).subscribe(id=>this.userId=id);
    }

    fetchUserSettings(): Observable<any> {
        return this.httpClient.get(`${this.usersUrl}/users/${this.userId}/settings`);
    }

    patchUserSettings(settings:any): Observable<any> {
        return this.httpClient.patch(`${this.usersUrl}/users/${this.userId}/settings`, settings);
    }
}
