/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { LightCardsRoutingModule } from './light-cards-routing.module';

describe('LightCardsRoutingModule', () => {
  let cardsRoutingModule: LightCardsRoutingModule;

  beforeEach(() => {
    cardsRoutingModule = new LightCardsRoutingModule();
  });

  it('should create an instance', () => {
    expect(cardsRoutingModule).toBeTruthy();
  });
});
