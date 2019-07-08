import {Pipe, PipeTransform} from '@angular/core';
import * as moment from 'moment';

@Pipe({
  name: 'xAxisTickFormat'
})
export class XAxisTickFormatPipe implements PipeTransform {
  /**
   * return a string formatted from value by the according cluster level
   * @param value
   * @param clusterLevel
   */
  transformHovered(value: any, clusterLevel: string): string {
    if (typeof value === 'string') {
      return value;
    }
    const date = moment(value);
    switch (clusterLevel) {
      case 'W': case '7D': case 'D': {
        return date.format('ddd DD MMM HH') + 'h';
      }
      case 'M': case 'Y': {
        return date.format('ddd DD MMM YYYY');
      }
      default: {
        return value;
      }
    }
  }

  /**
   * special format function used for week ticks formatting, display only hours for each ticks
   * if cluster level is W return a string formatted from value
   * else return a empty string
   * @param value
   * @param clusterLevel
   */
  transformAdvanced(value: any, clusterLevel: string): string {
    if (clusterLevel) {
      const date = moment(value);
      if (date) {
        if (clusterLevel === 'D') {
          return date.format('HH') + 'h';
        } else if (clusterLevel === 'Min') {
          return date.format('mm');
        }
      }
    }
    return '';
  }

  /**
   * return a string formatted from value by the according cluster level
   * @param value
   * @param clusterLevel
   */
  transform(value: any, clusterLevel: string): string {
    // if (languageTag) {
    /*if (value instanceof moment) {*/
    // const datePipe = moment.locale(languageTag);
    if (typeof value === 'string') {
      return value;
    }
    const date = moment(value);
    const startYear = moment(date).startOf('year');
    switch (clusterLevel) {
      case 'W' : case '7D': case 'D': {
        if (date.valueOf() === startYear.valueOf()) {
          return date.format('ddd DD MMM YYYY');
        }
        if (date.hours() === 0) {
          return date.format('ddd DD MMM');
        } else {
          return date.format('HH');
        }
      }
      case 'Min': {
        if (date.minutes() === 0) {
          if (date.hour() === 0) {
            return date.format('ddd DD MMM');
          } else {
            return date.format('HH');
          }
        }
      }
      case 'M': {
        if (date.valueOf() === startYear.valueOf()) {
          return date.format('DD MMM YY');
        }
        return date.format('ddd DD MMM');
      }
      case 'Y': {
        if (date.valueOf() === startYear.valueOf()) {
          return date.format('D MMM YY');
        }
        return date.format('D MMM');
      }
      default: {
        return value;
      }
    }
        // else {
        // return value.toString();
        // }
  }
}
