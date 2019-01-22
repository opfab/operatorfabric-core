import {TestBed} from '@angular/core/testing';

import {TimeService} from './time.service';

describe('TimeService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    TestBed.configureTestingModule({
        providers: [
            TimeService
        ]
    })
    const service: TimeService = TestBed.get(TimeService);
    expect(service).toBeTruthy();
  });
});
