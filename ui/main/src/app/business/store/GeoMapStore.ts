/* Copyright (c) 2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */
import {Observable, ReplaySubject} from 'rxjs';

export class GeoMapStore {
    private static readonly zoomToLocation = new ReplaySubject<string>(1);
    private static readonly highlightedCard = new ReplaySubject<HighlightedCard>(1);

    public static getZoomToLocation(): Observable<string> {
        return GeoMapStore.zoomToLocation.asObservable();
    }

    public static getHighlightedCard(): Observable<HighlightedCard> {
        return GeoMapStore.highlightedCard.asObservable();
    }

    public static setZoomToLocation(cardId: string): void {
        GeoMapStore.zoomToLocation.next(cardId);
    }

    public static setHighlightedCard(cardId: string, highLight: boolean): void {
        GeoMapStore.highlightedCard.next(new HighlightedCard(cardId, highLight));
    }
}

export class HighlightedCard {
    public readonly cardId: string;
    public readonly highlight: boolean;

    constructor(cardId: string, highLight: boolean) {
        this.cardId = cardId;
        this.highlight = highLight;
    }
}
