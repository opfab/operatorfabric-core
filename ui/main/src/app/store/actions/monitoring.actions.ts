import {Action} from '@ngrx/store';
import {Page} from '@ofModel/page.model';
import {LineOfMonitoringResult} from '@ofModel/line-of-monitoring-result.model';

export enum MonitoringActionType {
 SendMonitoringQuery = '[Monitoring] Send Query'
    , UpdateMonitoringFilter = '[Monitoring] Update Filters'
    , MonitoringQuerySuccess = '[Monitoring] Notify successful query'
    , UpdateMonitoringPage = '[Monitoring] Update query result page'
    , HandleUnexpectedError = '[Monitoring] Throw an unexpcted error'

}

export class SendMonitoringQuery implements Action {
    readonly type = MonitoringActionType.SendMonitoringQuery;

    constructor(public payload: { params: Map<string, string[]> }) {
    }

}

export class UpdateMonitoringFilter implements Action {
    readonly type = MonitoringActionType.UpdateMonitoringFilter;
    constructor(public payload: { filters: Map<string, string[]> }) {
    }
}

export class MonitoringQuerySuccess implements Action {
    readonly type = MonitoringActionType.MonitoringQuerySuccess;
    constructor(public payload: { resultPage: Page<LineOfMonitoringResult> }) {
    }
}

export class UpdateMonitoringPage implements Action {
    readonly type = MonitoringActionType.UpdateMonitoringPage;
    constructor(public payload: { page: number }) {
    }
}

export class HandleUnexpectedError implements Action {
    readonly type = MonitoringActionType.HandleUnexpectedError;
    constructor(public payload: { error: any}) {
    }
}

export type MonitoringAction =
    | SendMonitoringQuery
    | UpdateMonitoringFilter
    | MonitoringQuerySuccess
    | UpdateMonitoringPage
    | HandleUnexpectedError
    ;
