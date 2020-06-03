

import {FeedModule} from './feed.module';

describe('FeedModule', () => {
  let cardsModule: FeedModule;

  beforeEach(() => {
    cardsModule = new FeedModule();
  });

  it('should create an instance', () => {
    expect(cardsModule).toBeTruthy();
  });
});
