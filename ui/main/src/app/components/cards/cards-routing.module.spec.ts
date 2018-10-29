/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { CardsRoutingModule } from './cards-routing.module';

describe('CardsRoutingModule', () => {
  let cardsRoutingModule: CardsRoutingModule;

  beforeEach(() => {
    cardsRoutingModule = new CardsRoutingModule();
  });

  it('should create an instance', () => {
    expect(cardsRoutingModule).toBeTruthy();
  });
});
