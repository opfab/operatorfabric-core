import { DateTimeNgb } from './datetime-ngb.model';


export interface IArchiveFilter {

    publisher?: string[];
    process?: string[];
    startNotifDate?: DateTimeNgb;
    endNotifDate?: DateTimeNgb;
    startBusnDate?: DateTimeNgb;
    endBusnDate?: DateTimeNgb;
    pageNumber?: string;
    totalNumber?: string;
}