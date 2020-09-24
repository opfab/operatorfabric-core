import {Moment} from 'moment-timezone';
import {I18n} from '@ofModel/i18n.model';

export interface LineOfMonitoringResult {
    creationDateTime: Moment;
    beginningOfBusinessPeriod: Moment;
    endOfBusinessPeriod: Moment;
    title: I18n;
    summary: I18n;
    processName: string;
    coordinationStatus: string;
    coordinationStatusColor: string;
    cardId: string;
}
