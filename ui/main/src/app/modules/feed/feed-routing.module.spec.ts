
import {FeedRoutingModule} from './feed-routing.module';

describe('FeedRoutingModule', () => {
  let cardsRoutingModule: FeedRoutingModule;

  beforeEach(() => {
    cardsRoutingModule = new FeedRoutingModule();
  });

  it('should create an instance', () => {
    expect(cardsRoutingModule).toBeTruthy();
  });
});
