/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


import { Injectable } from "@angular/core";
import { environment } from '@env/environment';
import { Observable } from 'rxjs';
import { User} from '@ofModel/user.model';
import { UserWithPerimeters } from '@ofModel/userWithPerimeters.model';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class UserService {

    readonly userUrl: string;

    /**
     * @constructor
     * @param httpClient - Angular build-in
     */
    constructor(private httpClient: HttpClient) {
        this.userUrl = `${environment.urls.users}`;
    }

    askUserApplicationRegistered(user: string): Observable<User> {
        console.log("user in askUserApplicationRegistered service : " + user);
        return this.httpClient.get<User>(`${this.userUrl}/users/${user}`);
    }

    askCreateUser(userData: User): Observable<User> {
        console.log("user in askCreateUser service : " + userData.login);
        return this.httpClient.put<User>(`${this.userUrl}/users/${userData.login}`, userData);
    }

    currentUserWithPerimeters(): Observable<UserWithPerimeters> {
        return this.httpClient.get<UserWithPerimeters>(`${this.userUrl}/CurrentUserWithPerimeters`);
    }
}
