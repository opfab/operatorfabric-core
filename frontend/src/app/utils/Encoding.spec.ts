/* Copyright (c) 2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {base64urlDecode, base64urlEncode} from './Encoding';

describe('Encoding Utility Functions', () => {
    it('should correctly encode a string to base64url format', () => {
        const input = 'test-string';
        const expected = 'dGVzdC1zdHJpbmc';
        const result = base64urlEncode(input);
        expect(result).toEqual(expected);
    });
    it('should correctly encode a string with == in base 64 encoding  to base64url format', () => {
        const input = 'testwithdoubleequals__';
        // In base 64 it is converted to 'dGVzdHdpdGhkb3VibGVlcXVhbHNfXw=='
        const expected = 'dGVzdHdpdGhkb3VibGVlcXVhbHNfXw';
        const result = base64urlEncode(input);
        expect(result).toEqual(expected);
    });

    it('should correctly decode a base64url string back to the original string', () => {
        const input = 'dGVzdC1zdHJpbmc';
        const expected = 'test-string';
        const result = base64urlDecode(input);
        expect(result).toEqual(expected);
    });

    it('should handle empty strings for encoding and decoding', () => {
        const input = '';
        const encoded = base64urlEncode(input);
        const decoded = base64urlDecode(encoded);
        expect(encoded).toEqual('');
        expect(decoded).toEqual(input);
    });

    it('should handle special characters in strings', () => {
        const input = 'special+chars/with=padding';
        const encoded = base64urlEncode(input);
        const decoded = base64urlDecode(encoded);
        expect(decoded).toEqual(input);
    });
});
