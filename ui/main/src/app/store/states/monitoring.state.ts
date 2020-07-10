import {LineOfMonitoringResult} from '@ofModel/line-of-monitoring-result.model';
import {emptyPage, Page} from '@ofModel/page.model';

export interface MonitoringState {
    resultPage: Page<LineOfMonitoringResult>;
    filters: Map<string, string[]>;
    loading: boolean;
}

export const monitoringInitialSate: MonitoringState = {
    resultPage: emptyPage
    , filters: new Map()
    , loading: false
};
