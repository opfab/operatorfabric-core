/* Copyright (c) 2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Observable, ReplaySubject} from "rxjs";


export class ApplicationLoadingStep {

    private finishedWithoutError: ReplaySubject<boolean> = new ReplaySubject(1);
    private finishedWithErrors: ReplaySubject<boolean> = new ReplaySubject(1);

    public execute() {
            // implement here the step execution 
    }

    protected setStepAsFinishedWithoutError() : void {

        this.finishedWithoutError.next(true);
        this.finishedWithoutError.complete();
    } 


    protected setStepAsFinishedWithError() : void {

        this.finishedWithErrors.next(true);
        this.finishedWithErrors.complete();
    } 

    public isFinishedWithoutError(): Observable<boolean> {
        return this.finishedWithoutError.asObservable();
    } 

    
    public isFinishedWithErrors(): Observable<boolean> {
        return this.finishedWithErrors.asObservable();
    } 
}


