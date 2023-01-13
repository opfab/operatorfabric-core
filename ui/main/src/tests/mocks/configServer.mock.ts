import {Observable, ReplaySubject} from 'rxjs';
import {ConfigServer} from 'app/business/config/config.server';

export class ConfigServerMock implements ConfigServer {

    private webUiConf = new ReplaySubject<any>();
    private menuConf = new ReplaySubject<any>();

    getWebUiConfiguration(): Observable<any> {
        return this.webUiConf.asObservable();
    }

    getMenuConfiguration(): Observable<any> {
        return this.menuConf.asObservable();
    }

    setWebUIConfiguration(webuiConf:any) {
        this.webUiConf.next(webuiConf);
    }

    setMenuConfiguration(menuConf:any) {
        this.menuConf.next(menuConf);
    }
}
