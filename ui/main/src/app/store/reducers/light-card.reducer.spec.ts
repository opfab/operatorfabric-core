/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { reducer } from './light-card.reducer';
import {lightCardInitialState} from '@ofStates/light-card.state';

describe('LightCard Reducer', () => {
  describe('unknown action', () => {
    it('should return the initial state', () => {
      const action = {} as any;

      const result = reducer(lightCardInitialState, action);

      expect(result).toBe(lightCardInitialState);
    });
  });
});
