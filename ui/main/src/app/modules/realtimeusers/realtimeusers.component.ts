/* Copyright (c) 2021-2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Component, OnDestroy, OnInit} from '@angular/core';
import {UserService} from '@ofServices/user.service';
import {RealTimeScreensService} from '@ofServices/real-time-screens.service';
import {RealTimeScreen} from '@ofModel/real-time-screens.model';
import {User} from '@ofModel/user.model';
import {EntitiesService} from '@ofServices/entities.service';
import {GroupsService} from '@ofServices/groups.service';

@Component({
  selector: 'of-realtimeusers',
  templateUrl: './realtimeusers.component.html',
  styleUrls: ['./realtimeusers.component.scss']
})
export class RealtimeusersComponent implements OnInit, OnDestroy {

  realTimeUsersConnected: User[] = [];
  interval;

  realTimeScreens: Array<RealTimeScreen>;
  connectedUsersPerEntityAndGroup: Map<string, Array<string>> = new Map<string, Array<string>>();

  constructor(private userService: UserService,
              private realTimeScreensService: RealTimeScreensService,
              private entitiesService: EntitiesService,
              private groupsService: GroupsService) { }

  ngOnInit(): void {
    this.realTimeScreensService.loadRealTimeScreensData().subscribe(result => {
      this.realTimeScreens = result.realTimeScreens;
    });

    this.refresh();

    this.interval = setInterval(() => {
      this.refresh();
    }, 2000);
  }

  refresh() {
    this.userService.getAllUsers().subscribe(users => {
      const realTimeUsers: User[] = [];
      users.filter(user => user.groups.includes('REALTIME_USERS')).forEach(user => realTimeUsers.push(user));

      this.userService.loadConnectedUsers().subscribe(connectedUsers => {
        const connectedLogins: string[] = [];
        this.connectedUsersPerEntityAndGroup.clear();
        connectedUsers.forEach(connectedUser => connectedLogins.push(connectedUser.login));

        this.realTimeUsersConnected = realTimeUsers.filter(user => connectedLogins.includes(user.login));
        this.realTimeUsersConnected.sort((obj1, obj2) => this.compareObj(obj1, obj2));

        this.realTimeUsersConnected.forEach(realTimeUserConnected => {
          realTimeUserConnected.entities.forEach(entity => {
            realTimeUserConnected.groups.forEach(group => {

              let usersConnectedPerEntityAndGroup = this.connectedUsersPerEntityAndGroup.get(entity + '.' + group);

              if (! usersConnectedPerEntityAndGroup)
                usersConnectedPerEntityAndGroup = [];

              usersConnectedPerEntityAndGroup.push(realTimeUserConnected.login);
              this.connectedUsersPerEntityAndGroup.set(entity + '.' + group, usersConnectedPerEntityAndGroup);
            });
          });
        });
      });
    });
  }

  labelForConnectedUsers(entityAndGroup: string): string {
    let label = '';
    const connectedUsers = this.connectedUsersPerEntityAndGroup.get(entityAndGroup);

    if (!! connectedUsers)
      label = (connectedUsers.length > 1) ? connectedUsers[0] + ', ...' : connectedUsers[0];

    return label;
  }

  isSomeoneConnectedInEntityAndGroup(entityAndGroup: string): boolean {
    const connectedUsers = this.connectedUsersPerEntityAndGroup.get(entityAndGroup);
    return (!!connectedUsers) && (connectedUsers.length > 0);
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
