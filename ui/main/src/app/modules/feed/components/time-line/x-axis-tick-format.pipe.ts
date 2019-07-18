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
    if (clusterLevel) {
      const date = moment(value);
      switch (clusterLevel) {
        case 'Min':
        case 'Sec': {
          return date.format('ddd DD MMM HH') + 'h' + date.format('mm');
        }
        case 'Hou': {
          return date.format('ddd DD MMM HH') + 'h';
        }
        case 'Day':
        case 'Dat':
        case 'Wee':
        case 'Mon':
        case 'Yea':
        case 'nbW': {
          return date.format('ddd DD MMM YYYY');
        }
        default: {
          return date.format(clusterLevel);
        }
      }
    } else {
      return '';
    }
  }

  /**
   * special format function used for wrote all ticks on one horizontal line
   * if cluster level is correct return a string formatted from value
   * else return an empty string
   * @param value
   * @param clusterLevel
   */
  transformAdvanced(value: any, clusterLevel: string): string {
    if (clusterLevel) {
      const date = moment(value);
      if (date) {
        if (clusterLevel === 'Hou') {
          return date.format('HH') + 'h';
        } else if (clusterLevel === 'Min') {
          return date.format('mm');
        } else if (clusterLevel === 'Sec') {
          return date.format('ss');
        } else if (clusterLevel === 'nbW') {
          return date.format('ww');
        }
      }
    }
    return '';
  }

  /**
   * return a string formatted from value by the according cluster level
   * else return an empty string
   * @param value
   * @param clusterLevel
   */
  transform(value: any, clusterLevel: string): string {
    if (typeof value === 'string') {
      return value;
    }
    if (clusterLevel) {
    const date = moment(value);
    const startYear = moment(date).startOf('year');
      switch (clusterLevel) {
        case 'Hou' : {
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
        case 'Sec': {
          if (date.seconds() === 0) {
            if (date.minutes() === 0) {
              if (date.hour() === 0) {
                return date.format('ddd DD MMM');
              } else {
                return date.format('HH') + 'h';
              }
            } else {
              return date.format('mm');
            }
          }
        }
        case 'Day': {
          if (date.valueOf() === startYear.valueOf()) {
            return date.format('DD MMM YY');
          }
          return date.format('ddd DD MMM');
        }
        case 'Dat': {
          if (date.valueOf() === startYear.valueOf()) {
            return date.format('D MMM YY');
          }
          return date.format('D MMM');
        }
        case 'Wee': {
          return date.format('DD/MM/YY');
        }
        case 'Mon': {
          return date.format('MMM YY');
        }
        case 'Yea': {
          return date.format('YYYY');
        }
        case 'nbW': {
          return date.format('YYYY');
        }
        default: {
          return date.format(clusterLevel);
        }
      }
    } else {
      return '';
    }
  }
}
