/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {CardOperation} from "@ofModel/card-operation.model";
import {LightCard} from "@ofModel/light-card.model";
import {OpfabEventStreamServer} from "app/business/server/opfabEventStream.server";
import {ServerResponse, ServerResponseStatus} from "app/business/server/serverResponse";
import {Observable, of, Subject} from "rxjs";


export class OpfabEventStreamServerMock implements OpfabEventStreamServer {

    private events = new Subject<any>();

    initStream() {
        // nothing to do
    }
    getStreamInitDone(): Observable<void> {
        throw new Error("Method not implemented.");
    }
    closeStream() {
        // nothing to do
    }

    setEvents(event: any ) {
        this.events.next(event);
    }


    sendLightCard(card : LightCard) {
        const cardOperation = new CardOperation(1,1,0,card);
        this.events.next({data : JSON.stringify(cardOperation,this.convertEnumToType)});
    }

    convertEnumToType(key: string, value: string) {
        if (key === 'type') {
            return "ADD";
        }
        return value;
    }

    getEvents(): Observable<any> {
        return this.events.asObservable();
    }
    getStreamStatus(): Observable<any> {
        throw new Error("Method not implemented.");
    }

    setBusinessPeriod(StartDate: number, EndDate: number): Observable<ServerResponse<any>> {
       // nothing to do
       return of(new ServerResponse(null,ServerResponseStatus.OK,null));
    }

}