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
