
import {ThirdpartyRoutingModule} from './thirdparty-routing.module';

describe('FeedRoutingModule', () => {
  let thirdPartyRoutingModule: ThirdpartyRoutingModule;

  beforeEach(() => {
    thirdPartyRoutingModule = new ThirdpartyRoutingModule();
  });

  it('should create an instance', () => {
    expect(thirdPartyRoutingModule).toBeTruthy();
  });
});
