/* Copyright (c) 2024-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */
import {Observable, ReplaySubject} from 'rxjs';
import {HighlightedCard} from './model/HighlightedCard';

export class GeoMapService {
    private static readonly zoomToLocation = new ReplaySubject<string>(1);
    private static readonly highlightedCard = new ReplaySubject<HighlightedCard>(1);

    public static getZoomToLocation(): Observable<string> {
        return GeoMapService.zoomToLocation.asObservable();
    }

    public static getHighlightedCard(): Observable<HighlightedCard> {
        return GeoMapService.highlightedCard.asObservable();
    }

    public static setZoomToLocation(cardId: string): void {
        GeoMapService.zoomToLocation.next(cardId);
    }

    public static setHighlightedCard(cardId: string, highLight: boolean): void {
        GeoMapService.highlightedCard.next(new HighlightedCard(cardId, highLight));
    }
}
