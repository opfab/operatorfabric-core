/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Injectable } from '@angular/core';

@Injectable()
export class TimeService {

  constructor() { }

  public currentTime():number{
    return Date.now();
  }

  public parseString(value:string):number{
    return Date.parse(value);
  }

  public toString(value:number):string{
    return new Date(value).toISOString();
  }
}
