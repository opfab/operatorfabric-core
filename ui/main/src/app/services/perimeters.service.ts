/* Copyright (c) 2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Observable, Subject} from 'rxjs';
import {environment} from '@env/environment';
import {HttpClient} from '@angular/common/http';
import {catchError, takeUntil, tap} from 'rxjs/operators';
import {Injectable, OnDestroy} from '@angular/core';
import {CachedCrudService} from '@ofServices/cached-crud-service';
import {Perimeter} from '@ofModel/perimeter.model';

@Injectable({
  providedIn: 'root'
})
export class PerimetersService extends CachedCrudService implements OnDestroy {

  readonly perimetersUrl: string;
  private _perimeters: Perimeter[];

  private ngUnsubscribe$ = new Subject<void>();

  /**
   * @constructor
   * @param httpClient - Angular build-in
   */
  constructor(private httpClient: HttpClient) {
    super();
    this.perimetersUrl = `${environment.urls.perimeters}`;
  }

  ngOnDestroy() {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }

  deleteById(id: string) {
    const url = `${this.perimetersUrl}/${id}`;
    return this.httpClient.delete(url).pipe(
      catchError((error: Response) => this.handleError(error)),
      tap(() => {
        this.deleteFromCachedPerimeters(id);
      })
    );
  }

  private deleteFromCachedPerimeters(id: string): void {
    this._perimeters = this._perimeters.filter(perimeter => perimeter.id !== id);
  }

  private updateCachedPerimeters(perimeterData: Perimeter): void {
    const updatedPerimeters = this._perimeters.filter(perimeter => perimeter.id !== perimeterData.id);
    updatedPerimeters.push(perimeterData);
    this._perimeters = updatedPerimeters;
  }

  getAllPerimeters(): Observable<Perimeter[]> {
    return this.httpClient.get<Perimeter[]>(`${this.perimetersUrl}`).pipe(
      catchError((error: Response) => this.handleError(error))
    );
  }

  public loadAllPerimetersData(): Observable<any> {
    return this.getAllPerimeters()
        .pipe(takeUntil(this.ngUnsubscribe$)
            , tap({
                next: (perimeters) => {
                  if (!!perimeters) {
                    this._perimeters = perimeters;
                    console.log(new Date().toISOString(), 'List of perimeters loaded');
                  }
                },
              error: (error) => console.error(new Date().toISOString(), 'an error occurred', error)
            }));
  }

  public getPerimeters(): Perimeter[] {
    return this._perimeters;
  }

  public getCachedValues(): Array<Perimeter> {
    return this.getPerimeters();
  }

  createPerimeter(perimeterData: Perimeter): Observable<Perimeter> {
    return this.httpClient.post<Perimeter>(`${this.perimetersUrl}`, perimeterData).pipe(
      catchError((error: Response) => this.handleError(error)),
        tap(() => {
          this.updateCachedPerimeters(perimeterData);
        })
    );
  }

  updatePerimeter(perimeterData: Perimeter): Observable<Perimeter> {
    return this.httpClient.put<Perimeter>(`${this.perimetersUrl}` + '/' + perimeterData.id, perimeterData).pipe(
        catchError((error: Response) => this.handleError(error)),
        tap(() => {
          this.updateCachedPerimeters(perimeterData);
        })
    );
  }


  getAll(): Observable<any[]> {
    return this.getAllPerimeters();
  }

  create(data: any): Observable<any> {
    return this.createPerimeter(data);
  }

  update(data: any): Observable<any> {
    return this.updatePerimeter(data);
  }

}
