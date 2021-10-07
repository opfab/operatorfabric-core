/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


import {Injectable} from '@angular/core';
import {AcknowledgmentAllowedEnum, Process} from '@ofModel/processes.model';
import {Card} from '@ofModel/card.model';
import {UserWithPerimeters} from '@ofModel/userWithPerimeters.model';
import {LightCard} from '@ofModel/light-card.model';
import {Observable} from 'rxjs';
import {HttpClient, HttpResponse} from '@angular/common/http';
import {environment} from '@env/environment';
import {UserPermissionsService} from '@ofServices/user-permissions-.service';
import {LightCardsStoreService} from './lightcards-store.service';

@Injectable({
    providedIn: 'root'
})
export class AcknowledgeService {

    readonly userAckUrl: string;

    constructor(private userPermissionsService: UserPermissionsService,
                private httpClient: HttpClient,
                private lightCardsStoreService : LightCardsStoreService) {
        this.userAckUrl = `${environment.urls.cardspub}/cards/userAcknowledgement`;
    }

    postUserAcknowledgement(cardUid: string): Observable<HttpResponse<void>> {
        return this.httpClient.post<void>(`${this.userAckUrl}/${cardUid}`, null, {observe: 'response'});
    }

    deleteUserAcknowledgement(cardUid: string): Observable<HttpResponse<void>> {
        return this.httpClient.delete<void>(`${this.userAckUrl}/${cardUid}`, {observe: 'response'});
    }

    acknowledgeCard(lightCard: LightCard) {
        this.postUserAcknowledgement(lightCard.uid).subscribe(resp => {
            if (resp.status === 201 || resp.status === 200) {
                this.updateAcknowledgementOnLightCard(lightCard.id, true);
            } else {
                throw new Error('the remote acknowledgement endpoint returned an error status(' + resp.status + ')');
            }
        });
    }

    updateAcknowledgementOnLightCard(lightCardId: string, hasBeenAcknowledged: boolean) {
       this.lightCardsStoreService.setLightCardAcknowledgment(lightCardId,hasBeenAcknowledged);
    }

    isAcknowledgmentAllowed(user: UserWithPerimeters, card: Card | LightCard, processDefinition: Process): boolean {

        if (!processDefinition) return true;
        const state = Process.prototype.extractState.call(processDefinition, card);

        if (!!state) {
            if (!!state.acknowledgementAllowed) return true; // default value
            if (state.acknowledgmentAllowed === AcknowledgmentAllowedEnum.NEVER) return false;
            if (state.acknowledgmentAllowed === AcknowledgmentAllowedEnum.ALWAYS) return true;
            return !this.userPermissionsService.isUserEnabledToRespond(user, card, processDefinition);
        }
        return true;
    }
}
