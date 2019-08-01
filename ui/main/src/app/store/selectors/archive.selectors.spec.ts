/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {AppState} from "@ofStore/index";
import {
    buildSettingsSelector,
    selectSettings,
    selectSettingsData,
    selectSettingsLoaded
} from "@ofSelectors/settings.selectors";
import {settingsInitialState, SettingsState} from "@ofStates/settings.state";
import {archiveInitialState, ArchiveState} from "@ofStates/archive.state";
import {buildArchiveFilterSelector, selectArchiveFilters} from "@ofSelectors/archive.selectors";
import {arch} from "os";

describe('ArchiveSelectors', () => {
    let emptyAppState: AppState = {
        router: null,
        feed: null,
        timeline: null,
        authentication: null,
        card: null,
        menu: null,
        config: null,
        settings:null,
        time: null,
        archive: null
    }

    let existingFilterState: ArchiveState = {
        ...archiveInitialState,
        filters: new Map<string, string[]>().set("someFilter",["filterValue1","filterValue2"])
    };

    it('manage empty filters', () => {
        let testAppState = {...emptyAppState, archive: archiveInitialState};
        expect(selectArchiveFilters(testAppState)).toEqual(archiveInitialState.filters);
        expect(buildArchiveFilterSelector('someFilter')(testAppState)).toEqual(null);
        expect(buildArchiveFilterSelector('someFilter','fallback')(testAppState)).toEqual('fallback');
    });


    it('return archive  and specific filter', () => {
        let testAppState = {...emptyAppState, archive: existingFilterState};
        expect(selectArchiveFilters(testAppState)).toEqual(existingFilterState.filters);
        expect(buildArchiveFilterSelector('someFilter')(testAppState)).toEqual(["filterValue1","filterValue2"]);
        expect(buildArchiveFilterSelector('someFilter','fallback')(testAppState)).toEqual(["filterValue1","filterValue2"]);
        expect(buildArchiveFilterSelector('someOtherFilterThatDoesntExist','fallback')(testAppState)).toEqual("fallback");
    });




});
