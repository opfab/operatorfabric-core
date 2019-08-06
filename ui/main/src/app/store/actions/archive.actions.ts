/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Action} from '@ngrx/store';
import {LightCard} from "@ofModel/light-card.model";
import {LightCardActionTypes} from "@ofActions/light-card.actions";

export enum ArchiveActionTypes {
    UpdateArchiveFilter = '[Archive] Update Filter',
    SendArchiveQuery = '[Archive] Send Query',
    ArchiveQuerySuccess = '[Archive] Query was successful',
    HandleUnexpectedError = '[Archive] Handle unexpected error related to archived card issue',
    SelectArchivedLightCard = '[Archive] Select one archived light card'

}

export class UpdateArchiveFilter implements Action {
    readonly type = ArchiveActionTypes.UpdateArchiveFilter;
    /* istanbul ignore next */
    constructor(public payload:{filterPath: string, filterValues: string[]}){}
}

export class SendArchiveQuery implements Action {
    readonly type = ArchiveActionTypes.SendArchiveQuery;
    /* istanbul ignore next */
    constructor(public payload:{params: Map<string,string[]>}){}
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
    constructor(public payload:{lightCards: LightCard[]}){}
}

export class SelectArchivedLightCard implements Action {
    /* istanbul ignore next */
    readonly type = ArchiveActionTypes.SelectArchivedLightCard;
    /* istanbul ignore next */
    constructor(public payload: {selectedCardId:string}){}

}




export type ArchiveActions =
    UpdateArchiveFilter
    | SendArchiveQuery
    | HandleUnexpectedError
    | ArchiveQuerySuccess
    |SelectArchivedLightCard;
