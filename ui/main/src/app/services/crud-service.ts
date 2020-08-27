import { Observable } from 'rxjs';

export interface CrudService {
  getAll():Observable<Array<any>>;
  update(data: any):Observable<any>;
}
