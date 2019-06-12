import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({
  name: 'xAxisTickFormat'
})
export class XAxisTickFormatPipe implements PipeTransform {
  /**
   * return a string formatted from value by the according cluster level
   * @param value
   * @param languageTag
   * @param clusterLevel
   */
  transformHovered(value: any, languageTag: string, clusterLevel: string): string {
    if (languageTag) {
        const date = moment(value);
        if (clusterLevel === 'W') {
          return date.format('ddd DD MMM HH') + 'h';
        } else if (clusterLevel === 'M') {
            return date.format('ddd DD MMM YYYY');
        } else if (clusterLevel === 'Y') {
          return date.format('ddd DD MMM YYYY');
        }
    } else {
      return value.toString();
    }
  }

  /**
   * if cluster level is W return a string formatted from value
   * else return a empty string
   * @param value
   * @param clusterLevel
   */
  transformAdvanced(value: any, clusterLevel: string): string {
    const date = moment(value);
    if (clusterLevel === 'W') {
        return date.format('HH') + 'h';
    }
    return '';
  }

  /**
   * return a string formatted from value by the according cluster level
   * @param value
   * @param languageTag
   * @param clusterLevel
   */
  transform(value: any, languageTag: string, clusterLevel: string): string {
    if (languageTag) {
      /*if (value instanceof moment) {*/
        // const datePipe = moment.locale(languageTag);

        const date = moment(value);
        const startYear = moment(date).startOf('year');
        if (clusterLevel === 'W') {
            if (date.valueOf() === startYear.valueOf()) {
                return date.format('ddd DD MMM YYYY');
            }
          if (date.hours() === 0) {
            return date.format('ddd DD MMM');
          } else {
            return date.format('HH');
          }
        } else if (clusterLevel === 'M') {
          if (date.valueOf() === startYear.valueOf()) {
            return date.format('DD MMM YY');
          }
          return date.format('ddd DD MMM');
        } else if (clusterLevel === 'Y') {
          if (date.valueOf() === startYear.valueOf()) {
            return date.format('D MMM YY');
          }
          return date.format('D MMM');
        }
      /*} else {
        console.log('when languageTag exist and clusterLevel not defined');
        return value.toLocaleString(languageTag);
      }*/
    } else {
      return value.toString();
    }
  }
}
