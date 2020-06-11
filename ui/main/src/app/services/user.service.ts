
import { Injectable } from "@angular/core";
import { environment } from '@env/environment';
import { Observable } from 'rxjs';
import { User } from '@ofModel/user.model';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class UserService {

    readonly userUrl : string;

    /**
     * @constructor
     * @param httpClient - Angular build-in
     */
    constructor(private httpClient : HttpClient) {
        this.userUrl = `${environment.urls.users}`;
    }

    askUserApplicationRegistered(user : string) : Observable<User> {
        console.log("user in askUserApplicationRegistered service : " + user);
        return this.httpClient.get<User>(`${this.userUrl}/users/${user}`);
    }

    askCreateUser(userData : User) : Observable<User> {
        console.log("user in askCreateUser service : " + userData.login);
        return this.httpClient.put<User>(`${this.userUrl}/users/${userData.login}`, userData);
    }
}
