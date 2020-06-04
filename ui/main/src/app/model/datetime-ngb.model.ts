
import { NgbDateParserFormatter, NgbDateStruct, NgbTimeStruct } from '@ng-bootstrap/ng-bootstrap';

export function padNumber(value: any) {
  if (isNumber(value)) {
    return `0${value}`.slice(-2);
  } else {
    return '';
  }
}
export function toInteger(value: any): number {
  return parseInt(`${value}`, 10);
}
export function isNumber(value: any): value is number {
  return !isNaN(toInteger(value));
}
export class DateTimeNgb extends NgbDateParserFormatter {

  /* istanbul ignore next */
  constructor(readonly date?: NgbDateStruct, private time?: NgbTimeStruct) {
    super();
  }
  parse(value: string): NgbDateStruct {
    if (value) {
      const dateParts = value.trim().split('-').reverse();
      if (dateParts.length === 1 && isNumber(dateParts[0])) {
        return {day: toInteger(dateParts[0]), month: null, year: null};
      } else if (dateParts.length === 2 && isNumber(dateParts[0]) && isNumber(dateParts[1])) {
        return {day: toInteger(dateParts[0]), month: toInteger(dateParts[1]), year: null};
      } else if (dateParts.length === 3 && isNumber(dateParts[0]) && isNumber(dateParts[1]) && isNumber(dateParts[2])) {
        return {day: toInteger(dateParts[0]), month: toInteger(dateParts[1]), year: toInteger(dateParts[2])};
      }
    }
    return null;
  }
  format(): string {
    const {date} = this;
    return date ?
        `${date.year}-${isNumber(date.month) ? padNumber(date.month) : ''}-${isNumber(date.day) ? padNumber(date.day) : ''}` :
        '';
  }

  // a function that transform timestruct to string
  formatTime(): string {
    const {time} = this;
    return time ?
    `${isNumber(time.hour) ? padNumber(time.hour) : ''}:${isNumber(time.minute) ? padNumber(time.minute) : ''}` : '';
  }

  formatDateTime() {
    let result = '';
    const {date, time} = this;
    // if date is present
    if (date) {
      if (!time) {
        this.time = {hour: 0, minute: 0, second: 0};
      }
      result = `${this.format()}T${this.formatTime()}`;
    }
    return result;
  }

}
