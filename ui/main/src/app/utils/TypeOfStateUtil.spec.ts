/* Copyright (c) 2023-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Card} from 'app/model/Card';
import {getTypeOfStateColor} from './TypeOfStateUtil';
import {TypeOfStateEnum} from '@ofServices/processes/model/Processes';
import {getOneLightCard} from '@tests/helpers';
import {Severity} from 'app/model/Severity';

describe('TypeOfStateUtil Color', () => {
    it('should return grey if type of state is undefined', () => {
        expect(getTypeOfStateColor(undefined, {} as Card, [] as Card[])).toBe('grey');
    });
    it('should return red if type of state is CANCELED', () => {
        expect(getTypeOfStateColor(TypeOfStateEnum.CANCELED, {} as Card, [] as Card[])).toBe('red');
    });
    it('should return orange if type of state is INPROGRESS', () => {
        expect(getTypeOfStateColor(TypeOfStateEnum.INPROGRESS, {} as Card, [] as Card[])).toBe('darker-orange');
    });
    it('should return orange if type of state is FINISHED but not all responses has been provided', () => {
        const card = getOneLightCard({entitiesRequiredToRespond: ['entity1', 'entity2']});
        const childCards = [
            getOneLightCard({parentCardId: card.id, publisher: 'entity1', severity: Severity.COMPLIANT})
        ];
        expect(getTypeOfStateColor(TypeOfStateEnum.FINISHED, card, childCards)).toBe('darker-orange');
    });
    it('should return green if type of state is FINISHED and there is no entity required to respond', () => {
        const card = getOneLightCard({entitiesRequiredToRespond: []});
        const childCards = [];
        expect(getTypeOfStateColor(TypeOfStateEnum.FINISHED, card, childCards)).toBe('green');
    });

    it('should return green if type of state is FINISHED and entitiesRequiredToRespond is undefined', () => {
        const card = getOneLightCard({entitiesRequiredToRespond: undefined});
        const childCards = [];
        expect(getTypeOfStateColor(TypeOfStateEnum.FINISHED, card, childCards)).toBe('green');
    });

    it('should return green if type of state is FINISHED and all responses has been provided with no alarm severity', () => {
        const card = getOneLightCard({entitiesRequiredToRespond: ['entity1', 'entity2']});
        const childCards = [
            getOneLightCard({parentCardId: card.id, publisher: 'entity1', severity: Severity.COMPLIANT}),
            getOneLightCard({parentCardId: card.id, publisher: 'entity2', severity: Severity.COMPLIANT})
        ];
        expect(getTypeOfStateColor(TypeOfStateEnum.FINISHED, card, childCards)).toBe('green');
    });
    it('should return red if type of state is FINISHED and one of the responses has been provided with alarm severity', () => {
        const card = getOneLightCard({entitiesRequiredToRespond: ['entity1', 'entity2']});
        const childCards = [
            getOneLightCard({parentCardId: card.id, publisher: 'entity1', severity: Severity.ALARM}),
            getOneLightCard({parentCardId: card.id, publisher: 'entity2', severity: Severity.COMPLIANT})
        ];
        expect(getTypeOfStateColor(TypeOfStateEnum.FINISHED, card, childCards)).toBe('red');
    });
});
