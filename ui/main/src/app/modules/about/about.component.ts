
import {Component, OnInit} from '@angular/core';
import {AppState} from '@ofStore/index';
import {Store} from '@ngrx/store';
import {buildConfigSelector} from '@ofSelectors/config.selectors';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import _ from 'lodash';

/**
 * extracts configured application names along with their version, and sort them using their rank if declared
 *
 * @param applicationReferences: values declare in the 'web-ui.yml'. Each should contains at least
 * an application name and a version. Rank(optional) is used to order the list. The edge cases are tested in the
 * associated spec. Not that OperatoFabric come with the rank 0.
 *@returns the values sorted by rank
 * */
export function extractNameWithVersionAndSortByRank(applicationReferences) {
    return _.sortBy(_.values(applicationReferences), ['rank'], ['asc']);
}

@Component({
    selector: 'of-about',
    styleUrls: ['./about.component.scss'],
    templateUrl: './about.component.html'
})
export class AboutComponent implements OnInit {

    aboutElements: Observable<any>;

    constructor(private store: Store<AppState>) {
    }

    ngOnInit(): void {
        this.aboutElements = this.store.select(buildConfigSelector( 'settings.about' ))
            .pipe(map(applicationReferences => extractNameWithVersionAndSortByRank(applicationReferences)));
    }


}
