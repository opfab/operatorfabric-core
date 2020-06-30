import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

export enum PageType {
    FEED, ARCHIVE, THIRPARTY, SETTING, ABOUT
}

@Injectable()
export class AppService {

    constructor(private _router: Router) {}

    get pageType(): PageType {

        if ( this._router.routerState.snapshot.url.startsWith("/feed") ) {
            return PageType.FEED;
        } else if ( this._router.routerState.snapshot.url.startsWith("/archives") ) {
            return PageType.ARCHIVE;
        } else if ( this._router.routerState.snapshot.url.startsWith("/thirdparty") ) {
            return PageType.THIRPARTY;
        } else if ( this._router.routerState.snapshot.url.startsWith("/setting") ) {
            return PageType.SETTING;
        } else if ( this._router.routerState.snapshot.url.startsWith("/about") ) {
            return PageType.ABOUT;
        }
    }
}