import {Observable} from "rxjs";

export abstract class ConfigServer {

    abstract getWebUiConfiguration():Observable<any>;
    abstract getMenuConfiguration():Observable<any>;
}