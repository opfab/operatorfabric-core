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
import {FormControl, FormGroup} from '@angular/forms';
import {UserPreferencesService} from '@ofServices/user-preference.service';


@Component({
  selector: 'of-realtimeusers',
  templateUrl: './realtimeusers.component.html',
  styleUrls: ['./realtimeusers.component.scss']
})
export class RealtimeusersComponent implements OnInit, OnDestroy {

  realTimeScreensForm: FormGroup;

  realTimeUsersConnected: User[] = [];
  interval;

  realTimeScreens: Array<RealTimeScreen>;
  realTimeScreensLoaded = false;
  realTimeScreenIndexToDisplay: number;
  connectedUsersPerEntityAndGroup: Map<string, Array<string>> = new Map<string, Array<string>>();
  realTimeScreensOptions = [];
  columnsNumberPerScreenAndScreenColumn: Map<string, number> = new Map<string, number>();

  constructor(private userService: UserService,
              private realTimeScreensService: RealTimeScreensService,
              private entitiesService: EntitiesService,
              private groupsService: GroupsService,
              private userPreferences: UserPreferencesService) { }

  ngOnInit(): void {
    this.realTimeScreensForm = new FormGroup({
      realTimeScreen: new FormControl('')
    });

    this.changeScreenWhenSelectRealTimeScreen();

    this.realTimeScreensService.loadRealTimeScreensData().subscribe(result => {
      this.realTimeScreens = result.realTimeScreens;
      this.realTimeScreensLoaded = true;

      this.realTimeScreens.forEach((realTimeScreen, index) => {
        this.realTimeScreensOptions.push({value: index, label: realTimeScreen.screenName});
      });

      const screenIndexToDisplayFirst = this.userPreferences.getPreference('opfab.realTimeScreens.screenIndexToDisplayFirst');
      if (!! screenIndexToDisplayFirst)
        this.displayRealTimeScreenIndex(Number(screenIndexToDisplayFirst));
      else
        this.displayRealTimeScreenIndex(0);

      this.loadColumnsNumberPerScreenAndScreenColumn();
    });

    this.refresh();

    this.interval = setInterval(() => {
      this.refresh();
    }, 2000);
  }

  loadColumnsNumberPerScreenAndScreenColumn() {
    this.realTimeScreens.forEach((realTimeScreen, screenIndex) => {
      realTimeScreen.screenColumns.forEach((screenColumn, columnIndex) => {

        let biggerNumberOfColumns = 0;

        screenColumn.entitiesGroups.forEach(entityGroup => {
          if (entityGroup.groups.length > biggerNumberOfColumns)
            biggerNumberOfColumns = entityGroup.groups.length;
        });

        this.columnsNumberPerScreenAndScreenColumn.set(screenIndex + '.' + columnIndex, biggerNumberOfColumns);
      });
    });
  }

  refresh() {
    this.userService.getAllUsers().subscribe(users => {

      this.userService.loadConnectedUsers().subscribe(connectedUsers => {
        const connectedLogins: string[] = [];
        this.connectedUsersPerEntityAndGroup.clear();
        connectedUsers.forEach(connectedUser => connectedLogins.push(connectedUser.login));

        this.realTimeUsersConnected = users.filter(user => connectedLogins.includes(user.login));
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

  displayRealTimeScreenIndex(index: number): void {
    this.realTimeScreenIndexToDisplay = (!!this.realTimeScreens[index]) ? index : 0;
    this.realTimeScreensForm.get('realTimeScreen').setValue(this.realTimeScreenIndexToDisplay);
  }

  changeScreenWhenSelectRealTimeScreen(): void {
    this.realTimeScreensForm.get('realTimeScreen').valueChanges.subscribe((realTimeScreenIndex) => {
      if (!!realTimeScreenIndex) {
        this.realTimeScreenIndexToDisplay = realTimeScreenIndex;
        this.userPreferences.setPreference('opfab.realTimeScreens.screenIndexToDisplayFirst', String(realTimeScreenIndex));
      }
    });
  }

  labelForConnectedUsers(entityAndGroup: string): string {
    let label = '';
    const connectedUsers = this.connectedUsersPerEntityAndGroup.get(entityAndGroup);

    if (!! connectedUsers)
      label = (connectedUsers.length > 1) ? connectedUsers[0] + ', ...' : connectedUsers[0];

    return label;
  }

  getNumberOfConnectedUsersInEntityAndGroup(entityAndGroup: string): number {
    const connectedUsers = this.connectedUsersPerEntityAndGroup.get(entityAndGroup);
    if (!!connectedUsers)
      return connectedUsers.length;
    return 0;
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
