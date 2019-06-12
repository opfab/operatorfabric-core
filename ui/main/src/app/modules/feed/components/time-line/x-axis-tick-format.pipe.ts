import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';
import * as moment from 'moment';

@Pipe({
  name: 'xAxisTickFormat'
})
export class XAxisTickFormatPipe implements PipeTransform {

  transform(value: any, languageTag: string, clusterLevel: string): string {
    if (languageTag) {
      /*if (value instanceof moment) {*/
        // const datePipe = moment.locale(languageTag);

        const date = moment(value);
        const startYear = moment(date).startOf('year');
        if (clusterLevel === 'W') {

          /* Bordel ici */
          // hours
          if (date.hours() === 0) {
            // const hours = datePipe.transform(date, 'HH:mm');
            // const result = hours + '\n' + datePipe.transform(date, 'EE d MMMM');
            // return result;

            return date.format('ddd D, MMM'); // 'short');
          }
          else {
            // return '';
            return date.format('HH');
          }

          /* Bordel Fini */

          //  return datePipe.transform(date, 'd EE, MMMM'); //'short');
        } else if (clusterLevel === 'M') {
          if (date.valueOf() === startYear.valueOf()) {
            return date.format('ddd D, MMM YYYY');
          }
          return date.format('ddd D, MMM'); //'d EE, MMMM, ');
        } else if (clusterLevel === 'Y') {
          if (date.valueOf() === startYear.valueOf()) {
            return date.format('MMM D, YYYY');
          }
          return date.format('MMM D');
        }
        /*if (date.getHours() === 0 &&
          date.getMinutes() === 0 &&
          date.getSeconds() === 0) {
          return datePipe.transform(date, 'shortDate');
        }
        if (date.getSeconds() !== 0) {
          return datePipe.transform(date, 'mediumTime');
        } else {
          return datePipe.transform(date, 'shortTime');
        }*/
      /*} else {
        console.log('cas 1');
        return value.toLocaleString(languageTag);
      }*/
    } else {
      console.log('cas 2');
      return value.toString();
    }
  }

/*
  transform2(value: any, languageTag: string, clusterLevel: string, onOnTwo): string {
    let lkj = '';
    console.log('debut', onOnTwo);
    if (onOnTwo === 3) {
      // onOnTwo = 1;
      console.log('inside tranform2');
      const formatPipe: XAxisTickFormatPipe = new XAxisTickFormatPipe();
      lkj = formatPipe.transform(value, 'en-US', clusterLevel);
      // renvoie une string
      // this.multiHorizontalTicksLine(1)
    }/!* else {
      console.log('j');
      onOnTwo++;
    }*!/
    console.log('fin', lkj, onOnTwo);
    return(lkj);
  }*/
}
