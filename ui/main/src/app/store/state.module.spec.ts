/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { StateModule } from './state.module';

describe('StateModule', () => {
  let stateModule: StateModule;

  beforeEach(() => {
    stateModule = new StateModule();
  });

  it('should create an instance', () => {
    expect(stateModule).toBeTruthy();
  });
});
