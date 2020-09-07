import {Component, Input} from '@angular/core';
import {LineOfMonitoringResult} from '@ofModel/line-of-monitoring-result.model';
import {TimeService} from '@ofServices/time.service';
import {Moment} from 'moment-timezone';

@Component({
    selector: 'of-monitoring-table',
    templateUrl: './monitoring-table.component.html',
    styleUrls: ['./monitoring-table.component.scss']
})
export class MonitoringTableComponent {

    @Input() result: LineOfMonitoringResult[];

    constructor(readonly timeService: TimeService) {
    }

    displayTime(moment: Moment) {

        if (!!moment) {
            return this.timeService.formatDateTime(moment);
        }
        return '';
    }
}
