import { CardModule } from './card.module';

describe('CardModule', () => {
  let cardOperationsModule: CardModule;

  beforeEach(() => {
    cardOperationsModule = new CardModule();
  });

  it('should create an instance', () => {
    expect(cardOperationsModule).toBeTruthy();
  });
});
