
import {AppState} from '@ofStore/index';
import {archiveInitialState, ArchiveState} from '@ofStates/archive.state';
import { selectArchiveFilters} from '@ofSelectors/archive.selectors';
import {emptyAppState4Test} from "@tests/helpers";

describe('ArchiveSelectors', () => {
    const emptyAppState: AppState = emptyAppState4Test;

    const filters = new Map<string, string[]>();
    filters.set('endBusnDate', ['1566303137']);
    const existingFilterState: ArchiveState = {
        ...archiveInitialState,
        filters
    };

    it('manage empty filters', () => {
        const testAppState = {...emptyAppState, archive: archiveInitialState};
        expect(selectArchiveFilters(testAppState)).toEqual(archiveInitialState.filters);
    });
    it('return archive  and specific filter', () => {
        const testAppState = {...emptyAppState, archive: existingFilterState};
        expect(selectArchiveFilters(testAppState)).toEqual(existingFilterState.filters);
    });




});
