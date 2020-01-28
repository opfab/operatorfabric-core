/* Copyright (c) 2020, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {CardOperation, CardOperationType} from "@ofModel/card-operation.model";
import {getRandomAlphanumericValue} from "@tests/helpers";

describe( 'Card Operation', () =>{
    it('should convert a key named "type" wit the value "DELETE" into' +
        ' "CardOperationType.DELETE"', ()=>{
        const value = 'DELETE'
        expect(CardOperation.convertTypeIntoEnum('type',value))
            .toEqual(CardOperationType.DELETE)
    });

    it('should leave a key named differently than "type" unchanged' +
        'eeven if its value is "ADD","DELETE" or "UPDATE"', ()=>{
        let testedKey = null;
        while (testedKey === 'type' || testedKey === null) {
            testedKey = getRandomAlphanumericValue(3, 12);
        }
        const addValue = CardOperation.convertTypeIntoEnum(testedKey,'ADD');
        expect(addValue).toEqual('ADD')
        expect(addValue).not.toEqual(CardOperationType.ADD)

        const updateValue = CardOperation.convertTypeIntoEnum(testedKey, 'UPDATE')
        expect(updateValue).toEqual('UPDATE')
        expect(updateValue).not.toEqual(CardOperationType.UPDATE)

        const deleteValue = CardOperation.convertTypeIntoEnum(testedKey,'ADD')
        expect(deleteValue).toEqual('ADD')
        !expect(deleteValue).not.toEqual(CardOperationType.ADD)
    });
})
