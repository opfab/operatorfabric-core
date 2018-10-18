/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { CardOperationsModule } from './card-operations.module';

describe('CardOperationsModule', () => {
  let cardOperationsModule: CardOperationsModule;

  beforeEach(() => {
    cardOperationsModule = new CardOperationsModule();
  });

  it('should create an instance', () => {
    expect(cardOperationsModule).toBeTruthy();
  });
});
