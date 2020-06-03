

import {Action} from '@ngrx/store';
import {LightCard} from '@ofModel/light-card.model';
import {Page} from '@ofModel/page.model';

export enum ArchiveActionTypes {
    UpdateArchiveFilter = '[Archive] Update Filter',
    SendArchiveQuery = '[Archive] Send Query',
    ArchiveQuerySuccess = '[Archive] Query was successful',
    UpdateArchivePage = '[Archive] Update query result page',
    HandleUnexpectedError = '[Archive] Handle unexpected error related to archived card issue',
    SelectArchivedLightCard = '[Archive] Select one archived light card',
    FlushArchivesResult = '[Archive] Flush archives result'
}

export class UpdateArchiveFilter implements Action {
    readonly type = ArchiveActionTypes.UpdateArchiveFilter;
    /* istanbul ignore next */
    constructor(public payload: {filters: Map<string, string[]>}) {}
}


export class FlushArchivesResult implements Action {
    readonly type = ArchiveActionTypes.FlushArchivesResult;
}


export class SendArchiveQuery implements Action {
    readonly type = ArchiveActionTypes.SendArchiveQuery;
    constructor(public payload: {params: Map<string, string[]>}) {}
}

export class HandleUnexpectedError implements Action {
    /* istanbul ignore next */
    readonly type = ArchiveActionTypes.HandleUnexpectedError;

    /* istanbul ignore next */
    constructor(public payload: {error: Error}) {}
}

export class ArchiveQuerySuccess implements Action {
    readonly type = ArchiveActionTypes.ArchiveQuerySuccess;
    /* istanbul ignore next */
    constructor(public payload: {resultPage: Page<LightCard>}) {}

}

export class UpdateArchivePage implements Action {
    readonly type = ArchiveActionTypes.UpdateArchivePage;
    /* istanbul ignore next */
    constructor(public payload: {page: number}) {}
}
export class SelectArchivedLightCard implements Action {
    /* istanbul ignore next */
    readonly type = ArchiveActionTypes.SelectArchivedLightCard;
    /* istanbul ignore next */
    constructor(public payload: {selectedCardId: string}) {}
}

export type ArchiveActions = UpdateArchiveFilter
    | SendArchiveQuery
    | HandleUnexpectedError
    | ArchiveQuerySuccess
    | UpdateArchivePage
    | SelectArchivedLightCard
    | FlushArchivesResult;
