/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { CardsModule } from './cards.module';

describe('CardsModule', () => {
  let cardsModule: CardsModule;

  beforeEach(() => {
    cardsModule = new CardsModule();
  });

  it('should create an instance', () => {
    expect(cardsModule).toBeTruthy();
  });
});
