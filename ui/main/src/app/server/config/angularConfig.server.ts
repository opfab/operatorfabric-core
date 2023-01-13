import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {environment} from '@env/environment';
import {UIMenuFile} from '@ofModel/menu.model';
import {map, Observable} from 'rxjs';
import {ConfigServer} from '../../business/config/config.server';

@Injectable({
    providedIn: 'root'
})
export class AngularConfigServer implements ConfigServer {
    private configUrl: string;

    constructor(private httpClient: HttpClient) {
        this.configUrl = `${environment.urls.config}`;
    }

    getWebUiConfiguration(): Observable<any> {
        return this.httpClient.get(`${this.configUrl}`, {responseType: 'text'}).pipe(
            map((config) => {
                try {
                    config = JSON.parse(config);
                } catch (error) {
                    console.error('Invalid web-ui.json file:', error);
                }
                return config;
            })
        );
    }

    getMenuConfiguration(): Observable<any> {
        return this.httpClient
            .get<UIMenuFile>(`${environment.urls.menuConfig}`)
    }
}
