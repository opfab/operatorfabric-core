/* Copyright (c) 2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Component, OnDestroy, OnInit} from '@angular/core';
import {UserService} from '@ofServices/user.service';

@Component({
  selector: 'of-realtimeusers',
  templateUrl: './realtimeusers.component.html',
  styleUrls: ['./realtimeusers.component.scss']
})
export class RealtimeusersComponent implements OnInit, OnDestroy {

  realTimeUsersConnected: string[] = [];
  realTimeUsersDisconnected: string[] = [];
  interval;

  constructor(private userService: UserService) { }

  ngOnInit(): void {
    this.refresh();

    this.interval = setInterval(() => {
      this.refresh();
    }, 2000);
  }

  refresh() {
    this.userService.getAllUsers().subscribe(users => {
      const realTimeLogins: string[] = [];
      users.filter(user => user.groups.includes('REALTIME_USERS')).forEach(user => realTimeLogins.push(user.login));

      this.userService.loadConnectedUsers().subscribe(connectedUsers => {
        const connectedLogins: string[] = [];
        connectedUsers.forEach(connectedUser => connectedLogins.push(connectedUser.login));

        this.realTimeUsersConnected = realTimeLogins.filter(login => connectedLogins.includes(login));
        this.realTimeUsersDisconnected = realTimeLogins.filter(login => !this.realTimeUsersConnected.includes(login));
        this.realTimeUsersConnected.sort((obj1, obj2) => this.compareObj(obj1, obj2));
        this.realTimeUsersDisconnected.sort((obj1, obj2) => this.compareObj(obj1, obj2));
      });
    });
  }

  ngOnDestroy() {
    clearInterval(this.interval);
  }

  compareObj(obj1, obj2) {
    if (obj1 > obj2)
      return 1;
    if (obj1 < obj2)
      return -1;
    return 0;
  }
}
