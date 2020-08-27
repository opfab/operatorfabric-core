import { Injectable } from '@angular/core';
import { CrudService } from './crud-service';
import { Observable } from 'rxjs';
import { Group } from '@ofModel/group.model';
import { environment } from '@env/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class GroupsService implements CrudService {

  readonly groupsUrl: string;

  /**
   * @constructor
   * @param httpClient - Angular build-in
   */
  constructor(private httpClient: HttpClient) {
    this.groupsUrl = `${environment.urls.groups}`;
  }
  
  getAllGroups(): Observable<Group[]> {
    return this.httpClient.get<Group[]>(`${this.groupsUrl}`);
  }



 updateGroup(groupsData: Group): Observable<Group> {
    return this.httpClient.post<Group>(`${this.groupsUrl}`, groupsData);
  }


  getAll(): Observable<any[]> {
    return this.getAllGroups();
  }
  
  update(data: any): Observable<any> {
    return this.updateGroup(data);
  }

}
