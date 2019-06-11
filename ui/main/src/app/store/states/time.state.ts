import * as moment from 'moment-timezone'
import {neutralTimeReference, TimeReference, TimeSpeed} from "@ofModel/time.model";
import {Message} from "@ofModel/message.model";

export interface TimeState {

    timeReference: TimeReference;
    currentDate: moment.Moment;
    error: Message;
}

export const timeInitialState: TimeState = {
    timeReference:neutralTimeReference,
    currentDate: moment(),
    error: null
}
