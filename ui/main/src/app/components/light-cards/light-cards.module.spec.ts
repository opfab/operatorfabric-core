import { LightCardsModule } from './light-cards.module';

describe('LightCardsModule', () => {
  let cardsModule: LightCardsModule;

  beforeEach(() => {
    cardsModule = new LightCardsModule();
  });

  it('should create an instance', () => {
    expect(cardsModule).toBeTruthy();
  });
});
