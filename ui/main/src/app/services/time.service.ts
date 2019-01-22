import { Injectable } from '@angular/core';

@Injectable()
export class TimeService {

  constructor() { }

  public currentTime():number{
    return Date.now();
  }
}
