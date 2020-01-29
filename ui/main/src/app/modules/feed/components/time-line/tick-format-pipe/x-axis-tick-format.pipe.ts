/* Copyright (c) 2020, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Pipe, PipeTransform} from '@angular/core';
import * as moment from 'moment';
import {TimeService} from "@ofServices/time.service";

@Pipe({
  name: 'xAxisTickFormat'
})
export class XAxisTickFormatPipe implements PipeTransform {
  constructor(private timeService: TimeService) {
  }
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
          return this.timeService.predefinedFormat(date, 'dateInsideTooltipsWeek') +
              'h' + this.timeService.predefinedFormat(date, 'minutesOnly');
        }
        case 'Hou': {
          return this.timeService.predefinedFormat(date, 'dateInsideTooltipsWeek') + 'h';
        }
        case 'Day':
        case 'Dat':
        case 'Wee':
        case 'Mon':
        case 'Yea':
        case 'nbW': {
          return this.timeService.predefinedFormat(date, 'dateInsideTooltipsMonth');
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
          return this.timeService.predefinedFormat(date, 'hoursOnly') + 'h';
        } else if (clusterLevel === 'Min') {
          return this.timeService.predefinedFormat(date, 'minutesOnly');
        } else if (clusterLevel === 'Sec') {
          return this.timeService.predefinedFormat(date, 'secondedsOnly');
        } else if (clusterLevel === 'nbW') {
          return this.timeService.predefinedFormat(date, 'weekNumberOnly');
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
            return date.format( 'DD MMM YY');
            // return this.timeService.predefinedFormat(date, 'dateInsideTooltipsMonth');
          }
          if (date.hours() === 0) {
            return this.timeService.predefinedFormat(date, 'dateOnDay');
          } else {
            return this.timeService.predefinedFormat(date, 'hoursOnly');
          }
        }
        case 'Min': {
          if (date.minutes() === 0) {
            if (date.hour() === 0) {
              return this.timeService.predefinedFormat(date, 'dateOnDay');
            } else {
              return this.timeService.predefinedFormat(date, 'hoursOnly') + 'h';
            }
          }
        }
        case 'Sec': {
          if (date.seconds() === 0) {
            if (date.minutes() === 0) {
              if (date.hour() === 0) {
                return this.timeService.predefinedFormat(date, 'dateOnDay');
              } else {
                return this.timeService.predefinedFormat(date, 'hoursOnly') + 'h';
              }
            } else {
              return this.timeService.predefinedFormat(date, 'minutesOnly');
            }
          }
        }
        case 'Day': {
          if (date.valueOf() === startYear.valueOf()) {
            return this.timeService.predefinedFormat(date, 'dateOnDayNewYear');
          }
          return this.timeService.predefinedFormat(date, 'dateOnDay');
        }
        case 'Dat': {
          if (date.valueOf() === startYear.valueOf()) {
            return this.timeService.predefinedFormat(date, 'dateSimplifliedOnDayNewYear');
          }
          return this.timeService.predefinedFormat(date, 'dateSimplifliedOnDay');
        }
        case 'Wee': {
          return this.timeService.predefinedFormat(date, 'dateOnWeek');
        }
        case 'Mon': {
          return this.timeService.predefinedFormat(date, 'dateOnMonth');
        }
        case 'Yea': {
          return this.timeService.predefinedFormat(date, 'dateOnYear');
        }
        case 'nbW': {
          return this.timeService.predefinedFormat(date, 'dateOnYear');
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
