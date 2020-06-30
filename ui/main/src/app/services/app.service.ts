import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

export enum PageType {
    FEED, ARCHIVE
}

@Injectable()
export class AppService {

    constructor(private _router: Router) {}

    get pageType(): PageType {
        if ( this._router.routerState.snapshot.url.startsWith("/feed") ) {
            return PageType.FEED
        } else {
            return PageType.ARCHIVE;
        }
    }
}