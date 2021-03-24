/* Copyright (c) 2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


import { CountDown as CountDown } from './countdown';


describe('countdown testing ', () => {

  it('endDate is 10ms before current time , countdown is ended ', () => {
    let countDown = new CountDown(new Date().valueOf()-10,100);
    expect(countDown.isEnded()).toEqual(true);
    expect(countDown.isCounting()).toEqual(false);
    countDown.stopCountDown();
  });

  it('endDate is 10s after current time , count start 100s before endDate , countdown is not ended and is counting', () => {
    let countDown = new CountDown(new Date().valueOf()+10000,100);
    expect(countDown.isEnded()).toEqual(false);
    expect(countDown.isCounting()).toEqual(true);
    countDown.stopCountDown();
  });

  it('endDate is 1000s after current time , count start 100s before endDate , countdown is not ended and is not counting', () => {
    let countDown = new CountDown(new Date().valueOf()+1000000,100);
    expect(countDown.isEnded()).toEqual(false);
    expect(countDown.isCounting()).toEqual(false);
    countDown.stopCountDown();
  });


  it('endDate is 10s after current time , countdown value  shall be 00:10', () => {
    let countDown = new CountDown(new Date().valueOf()+10000,100);
    expect(countDown.getCountDown()).toEqual("00:10");
    countDown.stopCountDown();
  });

  it('endDate is 59s after current time , countdown value  shall be 00:59', () => {
    let countDown = new CountDown(new Date().valueOf()+59000,100);
    expect(countDown.getCountDown()).toEqual("00:59");
    countDown.stopCountDown();
  });

  it('endDate is 80s after current time , countdown value  shall be 01:20', () => {
    let countDown = new CountDown(new Date().valueOf()+80000,100);
    expect(countDown.getCountDown()).toEqual("01:20");
    countDown.stopCountDown();
  });


  it('endDate is 59min after current time , countdown value  shall be 59:00', () => {
    let countDown = new CountDown(new Date().valueOf()+ 59*60*1000,10000);
    expect(countDown.getCountDown()).toEqual("59:00");
    countDown.stopCountDown();
  });

  it('endDate is 1h 20min 15s after current time , countdown value  shall be 1:20:15', () => {
    let countDown = new CountDown(new Date().valueOf()+(80*60*1000+ 15000),100000);
    expect(countDown.getCountDown()).toEqual("1:20:15");
    countDown.stopCountDown();
  });

  it('endDate is 45h 00min 00s after current time , countdown value  shall be 45:00:00', () => {
    let countDown = new CountDown(new Date().valueOf()+(45*3600*1000),10000000);
    expect(countDown.getCountDown()).toEqual("45:00:00");
    countDown.stopCountDown();
  });

  it('endDate is 10s after current time , countdown value  shall be 00:09 after 1.5s ', (done) => {
    let countDown = new CountDown(new Date().valueOf()+10000,100);
    setTimeout( () => {
        expect(countDown.getCountDown()).toEqual("00:09");
        countDown.stopCountDown();
        done();
      }, 1500);
  });

  it('endDate is 10s after current time , countdown value  shall still be 00:10 after 1.5s if countDown has been stopped', (done) => {
    let countDown = new CountDown(new Date().valueOf()+10000,100);
    countDown.stopCountDown();
    setTimeout( () => {
        expect(countDown.getCountDown()).toEqual("00:10");
        done();
      }, 1500);
  });

  it('endDate is 1s after current time , after 2s isEnded shall be true', (done) => {
    let countDown = new CountDown(new Date().valueOf()+1000,100);
    setTimeout( () => {
        expect(countDown.isEnded()).toEqual(true);
        done();
      }, 2000);
  });

  it('endDate is 10s after current time , count start 9s before end date , countdown value  shall still be 00:08 after 2.5s if countDown has been stopped', (done) => {
    let countDown = new CountDown(new Date().valueOf()+10000,9);
    expect(countDown.isCounting()).toEqual(false);
    setTimeout( () => {
        expect(countDown.isCounting()).toEqual(true);
        expect(countDown.getCountDown()).toEqual("00:08");
        countDown.stopCountDown();
        done();
      }, 2500);
  });

});
